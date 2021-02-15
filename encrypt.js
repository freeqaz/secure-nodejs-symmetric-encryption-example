const crypto = require('crypto');

/**
 * This function creates random bytes. 
 * The bytes are cryptographically random and this function will block until enough entropy is available to guarantee
 * secure random number generation.
 */
function createIv(size) {
  if (size === undefined) {
    // Default to 32 bytes
    size = 32;
  }

  return new Promise((resolve, reject) => {
    if (typeof size !== 'number' || size <= 0) {
      reject('Invalid size specified, must be integer greater than 0');
      return;
    }

    // Secure random number generation. Returns a byte array.
    crypto.randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(buf);
    });
  });
}

async function encryptDataWithKey(data, key) {
  // Required random value to prevent brute force attacks (but it is not secret).
  // Without a random IV, a given value will always encrypt to the same output bytes.
  // Deterministic output would allow an attacker to "guess" the encrypted value without access to the encryption key.
  // The 128bit AES-GCM cipher requires 128 bits of entropy, which is 16 bytes (16 * 8 = 128).
  const iv = await createIv(16);

  // Choose an authenticated mode of AES for what we need. GCM mode gives us that.
  // 128 bits of entropy is 100% fine for our usage here
  // OAuth tokens will be long expired by the time it's cracked anyway. :)
  // Note: This crypto function requires a version of OpenSSL that supports it.
  const cipher = crypto.createCipheriv('id-aes128-GCM', key, iv);

  return new Promise((resolve, reject) => {
    // This string will contain the encrypted data as each chunk is added.
    let encryptedData = '';

    cipher.on('readable', () => {
      let chunk;
      while (null !== (chunk = cipher.read())) {
        encryptedData += chunk.toString('base64');
      }
    });

    cipher.on('end', () => {
      // This is used to verify that the data hasn't been tampered with. It's a feature of the AES-GCM mode.
      // In other encryption modes, like CBC, it's possible to leverage "side channel" attacks like "padding oracles".
      // GCM mode is authenticated and prevents these types of attacks.
      const authTag = cipher.getAuthTag();

      resolve({
        encryptedData: encryptedData,
        iv: iv,
        authTag: authTag
      });
    });

    cipher.write(data);
    cipher.end();
  });
}

(async () => {
  // Our data is constant for this example. In production, you could pass any string value in.
  const data = JSON.stringify({foo: 'bar'});

  // Print the encrypted value to make it easy to verify the example is working!
  console.log('Data to Encrypt:', data);

  const key = await createIv(16);

  // In production usage, this key would be constant and not randomly generated.
  // For this example, we will generate a key to use again for decryption.
  // Note: The key must be 128 bits (16 bytes) long exactly.
  console.log('Encryption Key:', key.toString('base64'));

  const {encryptedData, iv, authTag} = await encryptDataWithKey(data, key);

  // These 3 values are required to decrypt the data. If any of them are missing, decryption will fail.
  console.log('IV:', iv.toString('base64'));
  console.log('Auth Tag:', authTag.toString('base64'));
  console.log('Encrypted Data:', encryptedData.toString('base64'));
})();


