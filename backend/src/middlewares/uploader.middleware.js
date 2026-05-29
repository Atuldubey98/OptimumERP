const multer = require("multer");
const { storages } = require("../storages");
const path = require("path");
const crypto = require("crypto");
const logger = require("../logger");


const allowedMimes = {
  logos: ["image/jpeg", "image/png", "image/webp"],
  avatars: ["image/jpeg", "image/png", "image/webp"],
  signatures: ["image/jpeg", "image/png", "image/webp"],
  csv: ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
};


function safeFileName(originalName) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const random = crypto.randomBytes(6).toString("hex");
  return `${base}_${random}${ext}`;
}

function fileFilterFactory(bucket) {
  return (_, file, cb) => {
    const allowed = allowedMimes[bucket] || [];
    if (!allowed.includes(file.mimetype)) {
      logger.warn(`Rejected upload for ${bucket}: invalid mime ${file.mimetype}`);
      return cb(new Error("Invalid file type"), false);
    }
    file.originalname = safeFileName(file.originalname);
    cb(null, true);
  };
}
const logoStorage = storages.logo;
const avatarStorage = storages.avatar;
const signatureStorage = storages.signature;
const logoUploader = multer({
  storage: logoStorage,
  fileFilter: fileFilterFactory("logos"),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const avatarUploader = multer({
  storage: avatarStorage,
  fileFilter: fileFilterFactory("avatars"),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const signatureUploader = multer({
  storage: signatureStorage,
  fileFilter: fileFilterFactory("signatures"),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const csvUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilterFactory("csv"),
  limits: { fileSize: 5 * 1024 * 1024 },
});
module.exports = { logoUploader, avatarUploader, signatureUploader, csvUploader };
