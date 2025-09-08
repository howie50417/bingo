/**
 * AES Encryption and Decryption in Node.js
 * 
 * This script provides functions for AES encryption and decryption
 * with support for different modes (CBC, CFB, CTR, OFB, ECB)
 * Compatible with OpenSSL format used in many web implementations
 */

const crypto = require('crypto');

/**
 * AES encryption function (OpenSSL compatible)
 * @param {string} text - The text to encrypt
 * @param {string} password - The encryption password
 * @param {string} mode - Encryption mode (CBC, CFB, CTR, OFB, ECB)
 * @returns {string} - Base64 encoded encrypted string
 */
function encrypt(text, password, mode = 'CBC') {
  try {
    // OpenSSL EVP_BytesToKey derivation with salt
    const salt = crypto.randomBytes(8);
    
    // Key and IV derivation (OpenSSL compatible)
    const { key, iv } = deriveKeyAndIV(password, salt);
    
    // Map mode to crypto algorithm name
    const algorithm = `aes-256-${mode.toLowerCase()}`;
    
    // Create cipher
    const cipher = mode === 'ECB' 
      ? crypto.createCipheriv(algorithm, key, Buffer.alloc(0))
      : crypto.createCipheriv(algorithm, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    
    // Format: "Salted__" + salt + ciphertext (OpenSSL format)
    const result = Buffer.concat([
      Buffer.from('Salted__', 'ascii'),
      salt,
      Buffer.from(encrypted, 'binary')
    ]);
    
    return result.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error.message);
    return null;
  }
}

/**
 * AES decryption function (OpenSSL compatible)
 * @param {string} encryptedText - The base64 encoded encrypted text
 * @param {string} password - The decryption password
 * @param {string} mode - Decryption mode (CBC, CFB, CTR, OFB, ECB)
 * @returns {string} - Decrypted string
 */
function decrypt(encryptedText, password, mode = 'CBC') {
  try {
    // Convert from base64 to binary
    const buffer = Buffer.from(encryptedText, 'base64');
    
    // Check for "Salted__" prefix (OpenSSL format)
    if (buffer.toString('ascii', 0, 8) !== 'Salted__') {
      throw new Error('Invalid encrypted format: missing Salted__ prefix');
    }
    
    // Extract salt (8 bytes after "Salted__")
    const salt = buffer.slice(8, 16);
    
    // Extract ciphertext (everything after salt)
    const ciphertext = buffer.slice(16).toString('binary');
    
    // Derive key and IV from password and salt
    const { key, iv } = deriveKeyAndIV(password, salt);
    
    // Map mode to crypto algorithm name
    const algorithm = `aes-256-${mode.toLowerCase()}`;
    
    // Create decipher
    const decipher = mode === 'ECB'
      ? crypto.createDecipheriv(algorithm, key, Buffer.alloc(0))
      : crypto.createDecipheriv(algorithm, key, iv);
    
    // Decrypt the text
    let decrypted = decipher.update(ciphertext, 'binary', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
}

/**
 * Derive key and IV from password and salt (OpenSSL EVP_BytesToKey)
 * @param {string} password - The password
 * @param {Buffer} salt - The salt
 * @returns {Object} - Object containing key and iv buffers
 */
function deriveKeyAndIV(password, salt) {
  // OpenSSL EVP_BytesToKey derivation with MD5
  const keyLength = 32; // 256 bits for AES-256
  const ivLength = 16;  // 128 bits for AES IV
  const passwordBuffer = Buffer.from(password, 'utf8');
  
  let key = Buffer.alloc(0);
  let iv = Buffer.alloc(0);
  
  let derivedBytes = Buffer.alloc(0);
  let block = Buffer.alloc(0);
  
  while (derivedBytes.length < keyLength + ivLength) {
    const hash = crypto.createHash('md5');
    hash.update(block);
    hash.update(passwordBuffer);
    hash.update(salt);
    block = hash.digest();
    derivedBytes = Buffer.concat([derivedBytes, block]);
  }
  
  key = derivedBytes.slice(0, keyLength);
  iv = derivedBytes.slice(keyLength, keyLength + ivLength);
  
  return { key, iv };
}

// Example usage
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  
  if (args.length < 3 || (command !== 'encrypt' && command !== 'decrypt')) {
    console.log(`
Usage:
  node aes-node.js encrypt <text> <password> [mode]
  node aes-node.js decrypt <encrypted-text> <password> [mode]

Modes: CBC (default), CFB, CTR, OFB, ECB
    `);
    process.exit(1);
  }
  
  const text = args[1];
  const password = args[2];
  const mode = args[3]?.toUpperCase() || 'CBC';
  
  // Validate mode
  const validModes = ['CBC', 'CFB', 'CTR', 'OFB', 'ECB'];
  if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}. Valid modes are: ${validModes.join(', ')}`);
    process.exit(1);
  }
  
  if (command === 'encrypt') {
    const encrypted = encrypt(text, password, mode);
    console.log('Encrypted:', encrypted);
  } else {
    const decrypted = decrypt(text, password, mode);
    console.log('Decrypted:', decrypted);
  }
}

// Export functions for use in other modules
module.exports = {
  encrypt,
  decrypt
};
