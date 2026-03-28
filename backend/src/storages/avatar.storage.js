const multer = require("multer");
const fs = require("fs");
const path = require("path");

const avatarStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(process.env.NETWORK_STORAGE_PATH || "./uploads", "avatars");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (_, file, cb) => {
    cb(null, `avatar_${file.originalname}`);
  },
});

module.exports = avatarStorage;