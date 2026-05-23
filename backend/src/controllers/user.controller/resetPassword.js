const { z } = require("zod");
const User = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const { PasswordDoesNotMatch } = require("../../errors/user.error");
const bodyJoi = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});
const resetPassword = async (req, res) => {
  const user = await User.findById(req.session.user._id);
  const { currentPassword, newPassword } = await bodyJoi.parseAsync(
    req.body
  );
  const isPasswordMatching = await bcryptjs.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordMatching) throw new PasswordDoesNotMatch();
  user.password = await bcryptjs.hash(newPassword, await bcryptjs.genSalt(10));
  await user.save();
  return res.status(201).json({
    message: req.t("common:api.password_reset_done"),
  });
};

module.exports = resetPassword;
