const { isValidObjectId } = require("mongoose");
const { UserNotFound } = require("../../errors/user.error");
const User = require("../../models/user.model");

const deactivate = async (req, res) => {
  if (!isValidObjectId(req.body.userId)) throw new UserNotFound();
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if (!user) throw new UserNotFound();
  await user.deactivate();
  return res.status(200).json({ message: "User deactivated" });
};

module.exports = deactivate;
