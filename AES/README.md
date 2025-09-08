# Node.js AES Encryption and Decryption

This project provides a Node.js implementation of AES (Advanced Encryption Standard) encryption and decryption that is compatible with OpenSSL and web-based implementations.

## Features

- Compatible with OpenSSL format used in web implementations (like CryptoJS)
- Supports multiple encryption modes: CBC, CFB, CTR, OFB, and ECB
- Uses 256-bit encryption for strong security
- Simple API for encryption and decryption
- Command-line interface for quick encryption/decryption tasks

## Files

- `aes-node.js` - The main module containing the encryption and decryption functions
- `aes-example.js` - Example script demonstrating various use cases

## Usage

### As a Module

```javascript
const { encrypt, decrypt } = require('./aes-node');

// Encrypt some text
const encrypted = encrypt('Your secret message', 'your-secret-password', 'CBC');
console.log('Encrypted:', encrypted);

// Decrypt the text
const decrypted = decrypt(encrypted, 'your-secret-password', 'CBC');
console.log('Decrypted:', decrypted);
```

### Command Line Interface

```bash
# Encrypt a message
node aes-node.js encrypt "Your secret message" "your-secret-password" CBC

# Decrypt a message
node aes-node.js decrypt "encrypted-text-here" "your-secret-password" CBC
```

## Encryption Modes

- **CBC** (Cipher Block Chaining) - Default mode, provides good security
- **CFB** (Cipher Feedback) - Converts a block cipher into a stream cipher
- **CTR** (Counter) - Turns a block cipher into a stream cipher, good for longer texts
- **OFB** (Output Feedback) - Turns a block cipher into a stream cipher
- **ECB** (Electronic Codebook) - Simplest mode, not recommended for most applications

## Compatibility

This implementation is compatible with OpenSSL and web-based implementations like CryptoJS. It uses the same key derivation function (EVP_BytesToKey with MD5) and data format ("Salted__" + salt + ciphertext) as OpenSSL.

This means you can:
- Decrypt data encrypted with the web-based tool in Node.js
- Encrypt data in Node.js and decrypt it in the web-based tool

## Security Notes

- The implementation uses OpenSSL's EVP_BytesToKey with MD5 for key derivation to maintain compatibility
- For more secure applications, consider using a modern key derivation function like PBKDF2
- Always use strong, unique passwords for encryption
- CBC, CFB, CTR, and OFB modes use an Initialization Vector (IV) for added security
- ECB mode does not use an IV and may reveal patterns in the encrypted data

## Running the Examples

To see the encryption and decryption in action:

```bash
node aes-example.js
```

This will run through several examples demonstrating different encryption modes and use cases, including decrypting data from web implementations.
