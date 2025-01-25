const cloudinary = require("../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "OptimumERP",
    public_id: (req) => {
      return req.params.orgId;
    },
  },
});

module.exports = logoStorage;
