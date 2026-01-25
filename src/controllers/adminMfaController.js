import { PrismaClient } from '@prisma/client';
import { authenticator, totp } from 'otplib';
import qrcode from 'qrcode';
import { AppError, catchAsync } from '../utils/errors.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateMfaChallengeToken,
  verifyMfaChallengeToken,
} from '../utils/jwt.js';
import { config } from '../config/index.js';
import { decryptText, encryptText, generateBackupCodes } from '../utils/crypto.js';

const prisma = new PrismaClient();

authenticator.options = { step: 30 };
totp.options = { step: 30, window: config.mfa.totpWindow };

const issueSessionTokens = async (user) => {
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  const { password: _password, mfaSecret, mfaBackupCodes, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const issueMfaSecretForEnrollment = catchAsync(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  const admin = await prisma.user.findUnique({ where: { id: userId } });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Admin not found or not authorized', 404);
  }

  if (admin.mfaEnabled) {
    throw new AppError('MFA is already enabled', 400);
  }

  // Check if there's already a pending secret (not yet enabled)
  let secret;
  if (admin.mfaSecret && !admin.mfaEnabled) {
    // Reuse existing pending secret
    secret = decryptText(admin.mfaSecret);
  } else {
    // Generate new secret only if none exists
    secret = authenticator.generateSecret();
    const encryptedSecret = encryptText(secret);
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        mfaSecret: encryptedSecret,
        mfaBackupCodes: [],
        mfaEnabled: false,
      },
    });
  }

  const otpauthUrl = authenticator.keyuri(admin.email, config.mfa.issuer, secret);
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

  res.status(200).json({
    status: 'success',
    data: {
      secret,
      otpauthUrl,
      qrDataUrl,
    },
  });
});

export const enableMfaForEnrollment = catchAsync(async (req, res) => {
  const { token, userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  const admin = await prisma.user.findUnique({ where: { id: userId } });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Admin not found', 404);
  }

  if (admin.mfaEnabled) {
    throw new AppError('MFA is already enabled', 400);
  }

  if (!admin.mfaSecret) {
    throw new AppError('Generate a secret before enabling MFA', 400);
  }

  const secret = decryptText(admin.mfaSecret);

  const isValid = authenticator.check(token, secret);
  

  if (!isValid) {
    throw new AppError('Invalid or expired verification code', 401);
  }

  const backupCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(backupCodes.map((code) => hashPassword(code)));

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      mfaEnabled: true,
      mfaSecret: encryptText(secret),
      mfaBackupCodes: hashedCodes,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      mfaEnabled: true,
      backupCodes,
      message: 'MFA enabled successfully',
    },
  });
});

export const issueMfaSecret = catchAsync(async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Admin not found', 404);
  }

  if (admin.mfaEnabled) {
    throw new AppError('MFA is already enabled', 400);
  }

  const secret = authenticator.generateSecret();
  const encryptedSecret = encryptText(secret);
  const otpauthUrl = authenticator.keyuri(admin.email, config.mfa.issuer, secret);
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      mfaSecret: encryptedSecret,
      mfaBackupCodes: [],
      mfaEnabled: false,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      secret,
      otpauthUrl,
      qrDataUrl,
    },
  });
});

export const enableMfa = catchAsync(async (req, res) => {
  const { token } = req.body;

  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Admin not found', 404);
  }

  if (admin.mfaEnabled) {
    throw new AppError('MFA is already enabled', 400);
  }

  if (!admin.mfaSecret) {
    throw new AppError('Generate a secret before enabling MFA', 400);
  }

  const secret = decryptText(admin.mfaSecret);
  const isValid = authenticator.check(token, secret);

  if (!isValid) {
    throw new AppError('Invalid or expired verification code', 401);
  }

  const backupCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(backupCodes.map((code) => hashPassword(code)));

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      mfaEnabled: true,
      mfaSecret: encryptText(secret),
      mfaBackupCodes: hashedCodes,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      mfaEnabled: true,
      backupCodes,
    },
  });
});

export const disableMfa = catchAsync(async (req, res) => {
  const { password } = req.body;

  const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Admin not found', 404);
  }

  if (!admin.mfaEnabled) {
    throw new AppError('MFA is not enabled', 400);
  }

  const isPasswordValid = await comparePassword(password, admin.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid password', 401);
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: [],
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'MFA disabled successfully',
  });
});

export const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.user.findUnique({ where: { email } });

  if (!admin || admin.role !== 'ADMIN' || !admin.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, admin.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (admin.mfaEnabled) {
    const challengeToken = generateMfaChallengeToken(admin.id, admin.email);

    return res.status(200).json({
      status: 'success',
      data: {
        mfaRequired: true,
        challengeToken,
      },
    });
  }

  const session = await issueSessionTokens(admin);

  res.status(200).json({
    status: 'success',
    data: {
      ...session,
      mfaRequired: false,
    },
  });
});

export const verifyAdminMfa = catchAsync(async (req, res) => {
  const { token, backupCode, challengeToken } = req.body;

  const decoded = verifyMfaChallengeToken(challengeToken);

  if (!decoded) {
    throw new AppError('Invalid or expired MFA challenge', 401);
  }

  const admin = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!admin || admin.role !== 'ADMIN' || !admin.isActive) {
    throw new AppError('Admin not found or inactive', 404);
  }

  if (!admin.mfaEnabled || !admin.mfaSecret) {
    throw new AppError('MFA is not enabled for this account', 400);
  }

  const backupCodes = admin.mfaBackupCodes || [];
  let isValid = false;
  let updatedBackupCodes = backupCodes;

  // First, verify backup code (normalized) without decrypting the TOTP secret
  if (backupCode) {
    const normalizedBackupCode = String(backupCode).trim().toLowerCase();
    const remainingCodes = [];

    for (const hashed of backupCodes) {
      const matches = await comparePassword(normalizedBackupCode, hashed);
      if (matches && !isValid) {
        isValid = true;
        continue;
      }
      remainingCodes.push(hashed);
    }

    updatedBackupCodes = remainingCodes;
  }

  // If backup code didn't match and a TOTP token is provided, verify TOTP
  if (!isValid && token) {
    let secret;
    try {
      secret = decryptText(admin.mfaSecret);
    } catch (err) {
      throw new AppError('MFA verification failed', 500);
    }
    isValid = authenticator.check(token, secret);
  }

  if (!isValid) {
    throw new AppError('Invalid or expired MFA code', 401);
  }

  if (updatedBackupCodes.length !== backupCodes.length) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { mfaBackupCodes: updatedBackupCodes },
    });
  }

  const session = await issueSessionTokens(admin);

  res.status(200).json({
    status: 'success',
    data: {
      ...session,
      mfaRequired: false,
      backupCodesRemaining: updatedBackupCodes.length,
    },
  });
});
