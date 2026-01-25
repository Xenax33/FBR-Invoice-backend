import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateMfaChallengeToken } from '../utils/jwt.js';
import { AppError, catchAsync } from '../utils/errors.js';

const prisma = new PrismaClient();

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // ADMIN MFA ENFORCEMENT: Check if user is an admin
  if (user.role === 'ADMIN') {
    // Remove sensitive fields from user response
    const { password: _, mfaSecret, mfaBackupCodes, ...safeUser } = user;

    // If admin doesn't have MFA enabled, force enrollment
    if (!user.mfaEnabled) {
      return res.status(403).json({
        status: 'error',
        data: {
          requireMfaEnrollment: true,
          userId: user.id,
          email: user.email,
          message: 'MFA enrollment required for admin accounts',
        },
      });
    }

    // If admin has MFA enabled, require verification
    const challengeToken = generateMfaChallengeToken(user.id, user.email);

    return res.status(200).json({
      status: 'success',
      data: {
        mfaRequired: true,
        challengeToken,
        user: safeUser,
      },
    });
  }

  // Regular users (non-admin): normal login flow
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Calculate refresh token expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Remove sensitive fields from response
  const { password: _, mfaSecret, mfaBackupCodes, ...safeUser } = user;

  res.status(200).json({
    status: 'success',
    data: {
      user: safeUser,
      accessToken,
      refreshToken,
    },
  });
});

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken(
    storedToken.user.id,
    storedToken.user.email,
    storedToken.user.role
  );

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
});

export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const getProfile = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      businessName: true,
      province: true,
      address: true,
      ntncnic: true,
      role: true,
      mfaEnabled: true,
      postInvoiceTokenTest: true,
      validateInvoiceTokenTest: true,
      postInvoiceToken: true,
      validateInvoiceToken: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
