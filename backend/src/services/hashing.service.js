const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const algorithm = process.env.CRYPTO_ALGORITHM;
const secretKey = process.env.CRYPTO_SECRET;
const key = crypto.createHash(process.env.CRYPTO_HASH_ALGORITHM).update(String(secretKey)).digest();

exports.getHashedString = async (str) => {
  const SALT = await bcryptjs.genSalt(10);
  const hashedStr = await bcryptjs.hash(str, SALT);
  return hashedStr;
};

exports.compareHashAndActualString = async (str, hashedStr) => {
  return bcryptjs.compare(str, hashedStr);
};

exports.encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
};

exports.decrypt = (text) => {
  if (!text) return text;
  try {
    const textParts = text.split(":");
    if (textParts.length < 2) return text;
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = textParts.join(":");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
};


