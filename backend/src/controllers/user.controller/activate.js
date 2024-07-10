const { isValidObjectId } = require("mongoose");
const { UserNotFound } = require("../../errors/user.error");
const User = require("../../models/user.model");
const activate = async (req, res) => {
  if (!isValidObjectId(req.body.userId)) throw new UserNotFound();
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if (!user) throw new UserNotFound();
  await user.activate();
  return res.status(200).json({ message: "User activated" });
};

module.exports = activate;
