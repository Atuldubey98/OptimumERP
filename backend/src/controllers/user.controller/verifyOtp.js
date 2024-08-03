const Joi = require("joi");
const Otp = require("../../models/otp.model");
const User = require("../../models/user.model");
const { UserNotFound, InvalidOtp } = require("../../errors/user.error");
const bcryptjs = require("bcryptjs");
const bodyJoi = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().required().min(8).max(20).label("Password"),
  otp: Joi.string().required().label("OTP"),
});
const verifyOtp = async (req, res) => {
  const body = await bodyJoi.validateAsync(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user) throw new UserNotFound();
  const filter = {
    user: user._id,
    otp: body.otp,
    isVerified: false,
  };
  const otp = await Otp.findOneAndUpdate(filter, { isVerified: true });
  if (!otp) throw new InvalidOtp();
  user.password = await bcryptjs.hash(
    body.password,
    await bcryptjs.genSalt(10)
  );
  await user.save();
  return res.status(200).json({ message: "Password reset successful" });
};

module.exports = verifyOtp;
