const User = require("../../models/user.model");
const uploadAvatar = async (req, res) => {
  const path = req.file.path;
  const user = req.session.user;
  const userUpdates = { avatar: path };
  await User.updateOne({ _id: user._id }, userUpdates, { lean: true });
  req.session.user = { ...req.session.user, ...userUpdates };
  return res.status(200).json({ status: true, data: req.file });
};

module.exports = uploadAvatar;
