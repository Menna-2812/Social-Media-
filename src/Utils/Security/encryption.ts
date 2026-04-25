import crypto from "node:crypto";
import { ENCRYPTION_SECRET_KEY } from "../../config/config.service.js";

const IV_LENGTH = 16;
const ENCRYPTION_KEY: Buffer = Buffer.from(ENCRYPTION_SECRET_KEY, "utf-8");
if(ENCRYPTION_KEY.length !== 32){
    throw new Error("Encryption key must be 32 bytes");
}

export const encrypt = async (text: string): Promise<string> => {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encryptedData: string = cipher.update(text, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypt = async (encryptedData: string): Promise<string>  => {
  const [ivHex, encryptedText] = encryptedData.split(":");
  if(!ivHex || !encryptedText){
    throw new Error("Invalid encrypted data format");
  }
  const iv:Buffer = Buffer.from(ivHex, "hex");
  const deCipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv,
  );
  let deCryptedData = deCipher.update(encryptedText, "hex", "utf-8");
  deCryptedData += deCipher.final("utf-8");
  return deCryptedData;
};
