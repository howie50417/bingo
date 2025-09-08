/**
 * Example usage of AES encryption and decryption in Node.js
 * Compatible with OpenSSL format used in web implementations
 */

const { encrypt, decrypt } = require('./aes-node');

// Example 1: Basic encryption and decryption with CBC mode (default)
function example1() {
  console.log('Example 1: Basic CBC Mode (Default)');
  
  const plaintext = 'Hello, this is a secret message!';
  const password = 'my-secret-key';
  
  console.log(`Original text: ${plaintext}`);
  
  // Encrypt
  const encrypted = encrypt(plaintext, password);
  console.log(`Encrypted: ${encrypted}`);
  
  // Decrypt
  const decrypted = decrypt(encrypted, password);
  console.log(`Decrypted: ${decrypted}`);
  console.log('-----------------------------------');
}

// Example 2: Try different encryption modes
function example2() {
  console.log('Example 2: Different Encryption Modes');
  
  const plaintext = 'Testing different AES encryption modes';
  const password = 'another-secret-key';
  const modes = ['CBC', 'CFB', 'CTR', 'OFB', 'ECB'];
  
  modes.forEach(mode => {
    console.log(`\nMode: ${mode}`);
    
    // Encrypt
    const encrypted = encrypt(plaintext, password, mode);
    console.log(`Encrypted: ${encrypted}`);
    
    // Decrypt
    const decrypted = decrypt(encrypted, password, mode);
    console.log(`Decrypted: ${decrypted}`);
  });
  console.log('-----------------------------------');
}

// Example 3: Handling longer text
function example3() {
  console.log('Example 3: Encrypting Longer Text');
  
  const plaintext = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, 
  nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl 
  nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl 
  aliquam nisl, eget aliquam nisl nisl eget nisl.
  `;
  const password = 'long-text-secret-key';
  
  // Encrypt with CTR mode (good for longer texts)
  const encrypted = encrypt(plaintext, password, 'CTR');
  console.log(`Encrypted (truncated): ${encrypted.substring(0, 50)}...`);
  
  // Decrypt
  const decrypted = decrypt(encrypted, password, 'CTR');
  console.log(`Decrypted (truncated): ${decrypted.substring(0, 50)}...`);
  console.log('-----------------------------------');
}

// Example 4: Decrypt text from web implementation
function example4() {
  console.log('Example 4: Decrypt Text from Web Implementation');
  
  // This encrypted text was generated using the web implementation
  const encrypted = 'U2FsdGVkX1+iPbrKLDrB2P6Nhr2cNbbRid9xi9kPda0uWo7Ge6YVUCGoynPktUl8OSjW98BkQYp+X8I0M2KnZPw75yXLDUB6fYw4bVHjkvMur1/iYcLhmuTBsamQRNKAsEEzFHC/1v6wU3reKJ6rZKVePOVlr9hHVEYoPRVjlmE=';
  const password = '9SwJBdxD1Lc1';
  const mode = 'CBC';
  
  // Decrypt
  const decrypted = decrypt(encrypted, password, mode);
  console.log(`Decrypted: ${decrypted}`);
  console.log('-----------------------------------');
}

// Run all examples
console.log('AES Encryption and Decryption Examples\n');
example1();
example2();
example3();
example4();

console.log('\nAll examples completed successfully!');
