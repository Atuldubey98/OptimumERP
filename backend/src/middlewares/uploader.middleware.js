const multer = require("multer");
const logoStorage = require("../storages/logo.storage");
const avatarStorage = require("../storages/avatar.storage");
const logoUploader = multer({ storage: logoStorage });
const avatarUploader = multer({ storage: avatarStorage });
const csvUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel" || file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only CSV and Excel files are allowed."), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
module.exports = { logoUploader, avatarUploader, csvUploader };