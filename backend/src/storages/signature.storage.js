const multer = require("multer");
const fs = require("fs");
const path = require("path");

const signatureStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(process.env.NETWORK_STORAGE_PATH || "./uploads", "signatures");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `signature_${file.originalname}`);
  },
});

module.exports = signatureStorage;
