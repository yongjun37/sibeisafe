const PBKDF2_ITERATIONS = 200000
const SALT_LEN = 16;
const IV_LEN = 12;


async function genKey(password, salt) {
  const passwordBytes = new TextEncoder().encode(password);

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]);

  const mainKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt,
      iterations: PBKDF2_ITERATIONS
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );

  return mainKey;
}


export async function encrypt_file(file, password) {
  const plaintext = await file.arrayBuffer();
  
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));
  
  const key = await genKey(password, salt);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key, 
    plaintext
  );

  const uint8ciphertext = new Uint8Array(ciphertext);

  // format as [16 bytes salt][12 bytes IV][ciphertext]
  const combinedPayload = new Uint8Array(SALT_LEN + IV_LEN + uint8ciphertext.length);

  combinedPayload.set(salt, 0);
  combinedPayload.set(iv, SALT_LEN);
  combinedPayload.set(uint8ciphertext, SALT_LEN + IV_LEN);
  
  return new Blob([combinedPayload], { type: 'application/octet-stream' });
}


export async function decrypt_file(encryptedBlob, password) {
  const buffer = await encryptedBlob.arrayBuffer();
  const encryptedBytes = new Uint8Array(buffer);

  const salt = encryptedBytes.slice(0, SALT_LEN);
  const iv =  encryptedBytes.slice(SALT_LEN, SALT_LEN + IV_LEN);

  const ciphertext = encryptedBytes.slice(SALT_LEN + IV_LEN);

  const key = await genKey(password, salt);

  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key, 
    ciphertext
  );

  return new Blob([plaintext], { type: 'application/octet-stream' });
}