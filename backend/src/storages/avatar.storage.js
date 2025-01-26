const cloudinary = require("../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "OptimumERP",
    public_id: (req) => {
      const user = req.session.user;
      return user._id;
    },
  },
});

module.exports = avatarStorage;
