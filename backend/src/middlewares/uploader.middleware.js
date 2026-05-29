const multer = require("multer");
const { storages } = require("../storages");
const logoStorage = storages.logo;
const avatarStorage = storages.avatar;
const signatureStorage = storages.signature;
const logoUploader = multer({
  storage: logoStorage,
});
const avatarUploader = multer({
  storage: avatarStorage,
});
const signatureUploader = multer({
  storage: signatureStorage,
});
const csvUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only CSV and Excel files are allowed."),
        false,
      );
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
module.exports = { logoUploader, avatarUploader, signatureUploader, csvUploader };
