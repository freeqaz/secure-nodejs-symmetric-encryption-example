const crypto = require('crypto');
const readline = require('readline');

/** 
 * This function will decrypt data using AES-128-GCM mode.
 * This function requires:
 * - Encryption Data: Buffer, contains encrypted data.
 * - Decryption Key: The key used when the data was encrypted. Necessary to decrypt (AES is symmetric encryption).
 * - IV: This is the Initialization Vector and is random data used to prevent brute force attacks. (It is not secret).
 * - Authentication Tag: This data is prevents side channel attacks by validating that the data came from us.
 */
function decryptDataWithKeyAndIv(encryptedData, key, iv, authTag) {
  return new Promise((resolve, reject) => {
    const decipher = crypto.createDecipheriv('id-aes128-GCM', key, iv);
    decipher.setAuthTag(authTag);

    let decryptedData = '';
    decipher.on('readable', () => {
      while (null !== (chunk = decipher.read())) {
        decryptedData += chunk.toString('hex');
      }
    });

    decipher.on('end', () => {
      resolve(decryptedData);
    });

    decipher.write(encryptedData, 'hex');
    decipher.end();
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Just a helper function for grabbing data from the user interactively.
function askQuestion(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(Buffer.from(answer, 'hex'));
    });
  });
}

(async () => {
  const decryptionKey = await askQuestion('Key to decrypt data with? ');
  const iv = await askQuestion('IV to decrypt data with? ');
  const authTag = await askQuestion('Auth tag to authenticate data with? ');
  const encryptedData = (await askQuestion('Encrypted data? ')).toString('hex');

  rl.close();

  try {
    const decryptedData = await decryptDataWithKeyAndIv(encryptedData, decryptionKey, iv, authTag);
    console.log('Decrypted Data:', Buffer.from(decryptedData, 'hex').toString('utf8'));
  } catch(e) {
    console.error('Unable to decrypt data:', e);
  }
})();

