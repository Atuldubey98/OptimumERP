const { registerUserDto } = require("../../dto/user.dto");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const {
  registerUser,
  sendOtpEmailToUser,
} = require("../../services/auth.service");
const logger = require("../../logger");
const register = async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const isDevelopmentEnv = process.env.NODE_ENV === "development";
  const shouldSendEmail = process.env.NODE_MAILER_HOST;
  const userActive = isDevelopmentEnv || !shouldSendEmail;
  logger.info(
    "Registering user with email: ",
    body.email,
    " in env: ",
    process.env.NODE_ENV,
  );
  const registeredUser = await registerUser({
    ...body,
    active: userActive,
    verifiedEmail: userActive,
  });
  await UserActivatedPlan.create({
    user: registeredUser.id,
    purchasedBy: registeredUser.id,
  });
  if (shouldSendEmail && !isDevelopmentEnv)
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
    render:
      shouldSendEmail && !isDevelopmentEnv ? "verification-email" : "dashboard",
    message:
      shouldSendEmail && !isDevelopmentEnv
        ? "user:user_ui:register.toast_verify_title"
        : "user:user_ui:register.toast_registered_description",
    title:
      shouldSendEmail && !isDevelopmentEnv
        ? "user:user_ui:register.toast_verify_title"
        : "user:user_ui:register.toast_registered_title",
  });
};

module.exports = register;
