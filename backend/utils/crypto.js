import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16); // Initialization vector

// Key derivation function
const deriveKey = (walletId) => {
  return crypto.scryptSync(walletId, 'salt', 32); // You can use a unique salt per user
};

export const encrypt = (text, walletId) => {
  const key = deriveKey(walletId); // Derive key from wallet ID
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; // Return IV with the encrypted text
};

export const decrypt = (text, walletId) => {
  const key = deriveKey(walletId); // Derive key from wallet ID
  const [ivHex, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
