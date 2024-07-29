const { registerUserDto } = require("../../dto/user.dto");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const { registerUser } = require("../../services/auth.service");

const register = async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const registeredUser = await registerUser(body);
  await UserActivatedPlan.create({
    user: registeredUser.id,
    purchasedBy: registeredUser.id,
  });
  return res.status(201).json({
    data: {
      email: registeredUser.email,
      name: registeredUser.name,
      _id: registeredUser.id,
    },
    message: "User registered successfully !",
  });
};

module.exports = register;
