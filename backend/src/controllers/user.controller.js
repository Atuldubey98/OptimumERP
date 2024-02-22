const { isValidObjectId } = require("mongoose");
const { registerUserDto, loginUserDto } = require("../dto/user.dto");
const {
  UserDuplicate,
  UserNotFound,
  PasswordDoesNotMatch,
} = require("../errors/user.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
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
  const loggedInUser = { email, name: user.name, _id: user._id };
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
  const deactivatedUser = await User.findByIdAndDelete(userId, {
    active: false,
  });
  if (!deactivatedUser) throw new UserNotFound();
  return res.status(200).json({ message: "User deactivated" });
});
