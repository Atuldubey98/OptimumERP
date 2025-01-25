const multer = require("multer");
const logoStorage = require("../storages/logo.storage");
const logoUploader = multer({ storage: logoStorage });
module.exports = { logoUploader };
