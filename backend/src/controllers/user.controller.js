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
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const Otp = require("../models/otp.model");
const Joi = require("joi");
const path = require("path");
const transporter = nodemailer.createTransport({
  host: process.env.NODE_MAILER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_USER_NAME,
    pass: process.env.NODE_MAILER_APP_PASSWORD,
  },
});
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
  await UserActivatedPlan.create({ user: registeredUser.id });
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
  });
  const loggedInUser = {
    email,
    name: user.name,
    _id: user._id,
    currentPlan: activatedPlan,
  };
  req.session.user = loggedInUser;
  return res.status(200).json({ data: loggedInUser });
});

exports.currentUser = requestAsyncHandler(async (req, res) => {
  return res.status(200).json(req.session.user);
});

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
  const deactivatedUser = await User.findByIdAndUpdate(userId, {
    active: false,
  });
  if (!deactivatedUser) throw new UserNotFound();
  return res.status(200).json({ message: "User deactivated" });
});

exports.resetPassword = requestAsyncHandler(async (req, res) => {
  const user = await User.findById(req.session.user._id);
  const { currentPassword = "", newPassword = "" } = req.body;
  const isPasswordMatching = await bcryptjs.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordMatching) throw new PasswordDoesNotMatch();
  const hashedPassword = await bcryptjs.hash(
    newPassword,
    await bcryptjs.genSalt(10)
  );
  await User.findByIdAndUpdate(req.session.user._id, {
    password: hashedPassword,
  });
  return res.status(201).json({ message: "Done password resetting !" });
});

exports.forgotPassword = requestAsyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new UserNotFound();
  const otp = generateOTP();
  await Otp.findOneAndUpdate(
    {
      user: user._id,
      isVerified: false,
    },
    { expiresAt: new Date(Date.now()), isVerified: true }
  );
  await Otp.create({
    user: user._id,
    otp,
  });
  const locationTemplate = path.join(__dirname, `../views/otp/send_otp.ejs`);
  ejs.renderFile(
    locationTemplate,
    { otp, expirationTime: 10 },
    async (err, html) => {
      if (err) throw err;
      await transporter.sendMail({
        from: `"OptimumERP" <${process.env.NODE_MAILER_USER_NAME}>`,
        to: req.body.email,
        subject: "Reset password | OptimumERP",
        html,
      });
      return res
        .status(200)
        .json({ message: "OTP Sent ! Please check your email." });
    }
  );
});
const bodyJoi = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().required().min(8).max(20).label("Password"),
  otp: Joi.string().required().label("OTP"),
});
exports.verifyOtpForgotPasswordAndReset = requestAsyncHandler(
  async (req, res) => {
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
    const { password = "" } = req.body;
    const hashedPassword = await bcryptjs.hash(
      password,
      await bcryptjs.genSalt(10)
    );
    await User.findOneAndUpdate(
      { email: req.body.email },
      {
        password: hashedPassword,
      }
    );
    return res.status(200).json({ message: "Password reset successful" });
  }
);

function generateOTP() {
  let digits = "0123456789";
  let otp = "";
  let len = digits.length;
  for (let i = 0; i < 4; i++) otp += digits[Math.floor(Math.random() * len)];
  return otp;
}
