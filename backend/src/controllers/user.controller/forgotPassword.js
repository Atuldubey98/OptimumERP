const User = require("../../models/user.model");
const { UserNotFound } = require("../../errors/user.error");
const { sendOtpEmailToUser } = require("../../services/auth.service");
const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).lean();
  if (!user) throw new UserNotFound();
  await sendOtpEmailToUser({
    user,
    subject: "Reset password | OptimumERP",
    typeOfOtp: "forgotPassword",
  });
  return res
    .status(200)
    .json({ message: "OTP Sent ! Please check your email." });
};

module.exports = forgotPassword;
