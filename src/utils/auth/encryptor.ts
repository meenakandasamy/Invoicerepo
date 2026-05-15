import CryptoJS from 'crypto-js';

export const Encrypt = ({
  string,
  key,
  iv,
}: {
  string: string;
  key: string;
  iv: string;
}) => {
  const cipher = CryptoJS.AES.encrypt(string, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  });
  const result = cipher.ciphertext.toString(CryptoJS.enc.Base64);
  return result;
};

export const Decrypt = ({
  encryptedString,
  key,
  iv,
}: {
  encryptedString: string;
  key: string;
  iv: string;
}) => {
  // Convert Base64 string back to WordArray
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(encryptedString),
  });

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(
    cipherParams,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding,
    },
  );

  // Convert WordArray → UTF8 string
  const result = decrypted.toString(CryptoJS.enc.Utf8);

  return result;
};
