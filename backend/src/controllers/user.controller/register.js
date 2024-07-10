const { registerUserDto } = require("../../dto/user.dto");
const { UserDuplicate } = require("../../errors/user.error");
const User = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const register = async (req, res) => {
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
};

module.exports = register;
