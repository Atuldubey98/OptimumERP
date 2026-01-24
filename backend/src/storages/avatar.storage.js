const multer = require("multer");

const avatarStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, `${process.env.NETWORK_STORAGE_PATH}/avatars`);
  },
  filename: (_, file, cb) => {
    cb(null, `avatar_${file.originalname}`);
  },
});

module.exports = avatarStorage;
