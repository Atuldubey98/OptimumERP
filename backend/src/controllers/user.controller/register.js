const { registerUserDto } = require("../../dto/user.dto");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const {
  registerUser,
  sendOtpEmailToUser,
} = require("../../services/auth.service");

const register = async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const registeredUser = await registerUser(body);
  await UserActivatedPlan.create({
    user: registeredUser.id,
    purchasedBy: registeredUser.id,
  });
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
