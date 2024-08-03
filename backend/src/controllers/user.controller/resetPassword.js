const Joi = require("joi");
const User = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const { PasswordDoesNotMatch } = require("../../errors/user.error");
const bodyJoi = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});
const resetPassword = async (req, res) => {
  const user = await User.findById(req.session.user._id);
  const { currentPassword, newPassword } = await bodyJoi.validateAsync(
    req.body
  );
  const isPasswordMatching = await bcryptjs.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordMatching) throw new PasswordDoesNotMatch();
  user.password = await bcryptjs.hash(newPassword, await bcryptjs.genSalt(10));
  await user.save();
  return res.status(201).json({ message: "Done password resetting !" });
};

module.exports = resetPassword;
