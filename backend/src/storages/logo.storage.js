const multer = require("multer");

const logoStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, `${process.env.NETWORK_STORAGE_PATH}/logos`);
  },
  filename: (req, file, cb) => {
    cb(null, `logo_${file.originalname}`);
  },
});

module.exports = logoStorage;
