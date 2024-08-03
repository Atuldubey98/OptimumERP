const { renderHtml } = require("../../services/renderEngine.service");
const transporter = require("../../mailer");
const Otp = require("../../models/otp.model");
const User = require("../../models/user.model");
const path = require("path");
const { UserNotFound } = require("../../errors/user.error");
const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).lean();
  if (!user) throw new UserNotFound();
  await Otp.expireOtpByUserId(user._id);
  const generatedOtp = await Otp.generateOtpByUserId(user._id);
  const locationTemplate = path.join(__dirname, `../../views/otp/send_otp.ejs`);
  const html = await renderHtml(locationTemplate, {
    otp: generatedOtp.otp,
    expirationTime: 10,
  });
  await transporter.sendMail({
    from: `"OptimumERP" <${process.env.NODE_MAILER_USER_NAME}>`,
    to: req.body.email,
    subject: "Reset password | OptimumERP",
    html,
  });
  return res
    .status(200)
    .json({ message: "OTP Sent ! Please check your email." });
};

module.exports = forgotPassword;
