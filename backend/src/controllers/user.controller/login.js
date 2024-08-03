const { loginUserDto } = require("../../dto/user.dto");
const {
  UserNotFound,
  PasswordDoesNotMatch,
} = require("../../errors/user.error");
const User = require("../../models/user.model");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const {
  compareHashAndActualString,
} = require("../../services/hashing.service");
const {
  createLoggedInUserWithPlanAndLimits,
  getLimitsForActivePlan,
} = require("../../services/auth.service");

const login = async (req, res) => {
  const body = await loginUserDto.validateAsync(req.body);
  const { email, password } = body;
  const user = await User.findByEmailId(email);
  if (!user || !user.active || !user.password) throw new UserNotFound();
  const isPasswordMatching = await compareHashAndActualString(
    password,
    user.password
  );
  if (!isPasswordMatching) throw new PasswordDoesNotMatch();
  const loggedInUser = await getLoggedInUser(user);
  req.session.user = loggedInUser;
  return res.status(200).json({ data: loggedInUser });
};

module.exports = login;

async function getLoggedInUser(user) {
  const activatedPlan = await UserActivatedPlan.findOne({
    user: user._id,
  }).lean();
  const limits = getLimitsForActivePlan(activatedPlan);
  const loggedInUser = createLoggedInUserWithPlanAndLimits({
    user,
    activatedPlan,
    limits,
  });
  return loggedInUser;
}
