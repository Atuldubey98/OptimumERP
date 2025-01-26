const multer = require("multer");
const logoStorage = require("../storages/logo.storage");
const avatarStorage = require("../storages/avatar.storage");
const logoUploader = multer({ storage: logoStorage });
const avatarUploader = multer({ storage: avatarStorage });
module.exports = { logoUploader, avatarUploader };
