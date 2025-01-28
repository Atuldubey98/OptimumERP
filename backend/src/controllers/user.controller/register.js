const { registerUserDto } = require("../../dto/user.dto");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const {
  registerUser,
  sendOtpEmailToUser,
} = require("../../services/auth.service");

const register = async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const isDevelopmentEnv = process.env.NODE_ENV === "development";
  const registeredUser = await registerUser({
    ...body,
    active: isDevelopmentEnv,
    verifiedEmail : isDevelopmentEnv
  });
  await UserActivatedPlan.create({
    user: registeredUser.id,
    purchasedBy: registeredUser.id,
  });
  if (!isDevelopmentEnv)
    await sendOtpEmailToUser({
      user: registeredUser,
      subject: "Verification Mail | OptimumERP",
      typeOfOtp: "register",
    });
  return res.status(201).json({
    data: {
      email: registeredUser.email,
      name: registeredUser.name,
      _id: registeredUser.id,
    },
    message: "Email verification sent",
  });
};

module.exports = register;
