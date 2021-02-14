# secure-nodejs-symmetric-encryption-example
An example of how to securely encrypt data in Node.js using AES-128-GCM mode encryption with a static key. This repo provides an interactive CLI example for how to use the `crypto` API, with notes about specific details.

# How to use this
Simply run `encrypt.js` and then run `decrypt.js` with the values.

# Example Output
```
> node encrypt.js
Data to Encrypt: {"foo":"bar"}
Encryption Key: b77c4dc922a9b4a7743c88cf72ebf6f5
IV: b6d7ba5a3ba528763552e38bfdea4699
Auth Tag: ba433f009d586da61e71a2d1f5f9b1b7
Encrypted Data: de55a96f044c58826e50ed2699

> node decrypt.js
Key to decrypt data with? b77c4dc922a9b4a7743c88cf72ebf6f5
IV to decrypt data with? b6d7ba5a3ba528763552e38bfdea4699
Auth tag to authenticate data with? ba433f009d586da61e71a2d1f5f9b1b7
Encrypted data? de55a96f044c58826e50ed2699
Decrypted Data: {"foo":"bar"}
```

