const { UserNotFound, InvalidOtp } = require("../../errors/user.error");
const Otp = require("../../models/otp.model");
const UserModel = require("../../models/user.model");

const verifyRegisteredUserOtp = async (req, res) => {
  const user = await UserModel.findById(req.body.userId);
  if (!user) throw new UserNotFound();
  const filter = {
    user: user.id,
    type: "register",
    otp: req.body.otp,
    isVerified: false,
  };
  const otp = await Otp.findOneAndUpdate(filter, { isVerified: true });
  if (!otp) throw new InvalidOtp();
  user.verifiedEmail = true;
  await user.save();
  return res.status(200).json({ message: "Login to continue" });
};
module.exports = verifyRegisteredUserOtp;
