const cloudinary = require("../../cloudinary");
const User = require("../../models/user.model");
const removeLogo = async (req, res) => {
  const user = req.session?.user;
  const response = await cloudinary.uploader.destroy(`OptimumERP/${user?._id}`);
  await User.updateOne({ _id: user?._id }, { avatar: null }, { lean: true });
  req.session.user = { ...req.session.user, avatar: null };
  return res
    .status(200)
    .json({ status: response.result === "ok", message: "Avatar removed" });
};

module.exports = removeLogo;
