const { isValidObjectId } = require("mongoose");
const { registerUserDto, loginUserDto } = require("../dto/user.dto");
const {
  UserDuplicate,
  UserNotFound,
  PasswordDoesNotMatch,
  InvalidOtp,
} = require("../errors/user.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const UserActivatedPlan = require("../models/user_activated_plans");
const Otp = require("../models/otp.model");
const Joi = require("joi");
const path = require("path");
const transporter = require("../mailer");
const freePlanLimits = require("../constants/freePlanLimits");
const { renderHtml } = require("../helpers/render_engine.helper");
exports.registerUser = requestAsyncHandler(async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const { email, password, name } = body;
  const existingUser = await User.findByEmailId(email);
  if (existingUser) throw new UserDuplicate();
  const hashedPassword = await bcryptjs.hash(
    password,
    await bcryptjs.genSalt(10)
  );
  const registeredUser = await User.create({
    email,
    password: hashedPassword,
    name,
  });
  await UserActivatedPlan.create({
    user: registeredUser.id,
    purchasedBy: registeredUser.id,
  });
  return res.status(201).json({
    data: { email, name, _id: registeredUser.id },
    message: "User registered successfully !",
  });
});

exports.loginUser = requestAsyncHandler(async (req, res) => {
  const body = await loginUserDto.validateAsync(req.body);
  const { email, password } = body;
  const user = await User.findByEmailId(email);
  if (!user || !user.active) throw new UserNotFound();
  const isPasswordMatching = await bcryptjs.compare(password, user.password);
  if (!isPasswordMatching) throw new PasswordDoesNotMatch();
  const activatedPlan = await UserActivatedPlan.findOne({
    user: user._id,
  }).lean();
  const planLimits = {
    free: freePlanLimits,
    gold: { organizations: 3 },
    platinum: {},
  };
  const loggedInUser = {
    email,
    name: user.name,
    _id: user._id,
    currentPlan: activatedPlan,
    limits: planLimits[activatedPlan.plan],
  };
  req.session.user = loggedInUser;
  return res.status(200).json({ data: loggedInUser });
});

exports.currentUser = requestAsyncHandler(async (req, res) =>
  res.status(200).json(req.session.user)
);

exports.logoutUser = requestAsyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({ message: "User logged out !" });
    }
  });
});

exports.deactivateUser = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.body.userId)) throw new UserNotFound();
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if (!user) throw new UserNotFound();
  await user.deactivate();
  return res.status(200).json({ message: "User deactivated" });
});

exports.activateUser = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.body.userId)) throw new UserNotFound();
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if (!user) throw new UserNotFound();
  await user.activate();
  return res.status(200).json({ message: "User activated" });
});

exports.resetPassword = requestAsyncHandler(async (req, res) => {
  const bodyJoi = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  });
  const user = await User.findById(req.session.user._id);
  const { currentPassword, newPassword } = await bodyJoi.validateAsync(
    req.body
  );
  await user.resetPassword(currentPassword, newPassword);
  return res.status(201).json({ message: "Done password resetting !" });
});

exports.forgotPassword = requestAsyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).lean();
  if (!user) throw new UserNotFound();
  await Otp.expireOtpByUserId(user._id);
  const generatedOtp = await Otp.generateOtpByUserId(user._id);
  const locationTemplate = path.join(__dirname, `../views/otp/send_otp.ejs`);
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
});
exports.verifyOtpForgotPasswordAndReset = requestAsyncHandler(
  async (req, res) => {
    const bodyJoi = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().required().min(8).max(20).label("Password"),
      otp: Joi.string().required().label("OTP"),
    });
    const body = await bodyJoi.validateAsync(req.body);
    const user = await User.findOne({ email: body.email });
    if (!user) throw new UserNotFound();
    const otpFilter = {
      user: user._id,
      otp: body.otp,
      isVerified: false,
    };
    const otp = await Otp.findOneAndUpdate(otpFilter, { isVerified: true });
    if (!otp) throw new InvalidOtp();
    await user.changePassword(body.password);
    return res.status(200).json({ message: "Password reset successful" });
  }
);

exports.updateUserDetails = requestAsyncHandler(async (req, res) => {
  const userDto = Joi.object({
    name: Joi.string().label("Name").min(3).max(60).required(),
  });
  const body = await userDto.validateAsync(req.body);
  await User.findOneAndUpdate(
    {
      _id: req.session.user._id,
    },
    { name: body.name }
  );
  req.session.user = { ...req.session.user, name: body.name };
  return res.status(200).json({ message: "User details updated" });
});
