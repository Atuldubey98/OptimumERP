const { loginUserDto } = require("../../dto/user.dto");
const {
  UserNotFound,
  PasswordDoesNotMatch,
} = require("../../errors/user.error");
const User = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const freePlanLimits = require("../../constants/freePlanLimits");
const login = async (req, res) => {
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
    gold: {
      organizations: 3,
      ums: 100,
      taxes: 100,
      expenseCategories: 100,
      productCategories: 100,
    },
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
};

module.exports = login;
