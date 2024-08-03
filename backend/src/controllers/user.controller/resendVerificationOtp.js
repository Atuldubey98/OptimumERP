const { UserNotFound } = require("../../errors/user.error");
const UserModel = require("../../models/user.model");
const { sendOtpEmailToUser } = require("../../services/auth.service");

const resendVerificationLink = async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) throw new UserNotFound();
  if (user.verifiedEmail)
    return res.status(200).json({
      data: { userId: user.id, status: "verified" },
      message: "Email already verified",
    });

  await sendOtpEmailToUser({
    user,
    subject: "Verification Mail | OptimumERP",
    typeOfOtp: "register",
  });
  
  return res
    .status(200)
    .json({ data: { userId: user.id, status: "unverified" } });
};

module.exports = resendVerificationLink;
