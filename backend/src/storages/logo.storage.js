const multer = require("multer");
const fs = require("fs");
const path = require("path");

const logoStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(process.env.NETWORK_STORAGE_PATH, "logos");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `logo_${file.originalname}`);
  },
});

module.exports = logoStorage;