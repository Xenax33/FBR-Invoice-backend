import crypto from 'crypto';
import { config } from '../config/index.js';

const algorithm = 'aes-256-gcm';
const ivLength = 12;

const deriveKey = () => {
  return crypto.createHash('sha256').update(config.mfa.encryptionKey).digest();
};

export const encryptText = (plaintext) => {
  const iv = crypto.randomBytes(ivLength);
  const key = deriveKey();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
};

export const decryptText = (ciphertext) => {
  if (!ciphertext) return null;

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload');
  }

  const [ivHex, encryptedHex, authTagHex] = parts;
  const key = deriveKey();
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

export const generateBackupCodes = (count = config.mfa.backupCodesCount || 8) => {
  return Array.from({ length: count }, () => crypto.randomBytes(5).toString('hex'));
};
