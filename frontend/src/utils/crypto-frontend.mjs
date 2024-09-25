import CryptoJS from 'crypto-js';

// Derive a 256-bit key from user's address (use a secure hashing algorithm like SHA-256)
const deriveKey = (userAddress) => {
  return CryptoJS.SHA256(userAddress);
};

// Encrypt function using the user address as the key
export const encrypt = (data, userAddress) => {
  const key = deriveKey(userAddress);  // Generate key from address
  const iv = CryptoJS.lib.WordArray.random(16);  // Random IV for each encryption
  const encrypted = CryptoJS.AES.encrypt(data, key, { iv: iv });
  
  return {
    iv: iv.toString(CryptoJS.enc.Hex),  // Send IV as hex string
    encryptedData: encrypted.toString() // The encrypted data
  };
};

// Decrypt function
export const decrypt = (encryptedData, iv, userAddress) => {
  console.log("IN DECRYPT: " + encryptedData + " , " + iv + " , " + userAddress)
  const key = deriveKey(userAddress);
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: CryptoJS.enc.Hex.parse(iv)  // Convert IV back from hex
  });
  
  // If decryption fails, the resulting data might not be UTF-8, so check this
  try {
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Failed to decode UTF-8:', e);
    throw new Error('Decryption failed');
  }
};
