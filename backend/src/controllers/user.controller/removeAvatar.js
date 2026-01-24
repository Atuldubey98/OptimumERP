const User = require("../../models/user.model");
const removeLogo = async (req, res) => {
  const user = req.session?.user;
  await User.updateOne({ _id: user?._id }, { avatar: null }, { lean: true });
  req.session.user = { ...req.session.user, avatar: null };
  return res
    .status(200)
    .json({ status: true, message: "Avatar removed" });
};

module.exports = removeLogo;
