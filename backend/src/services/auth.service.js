const freePlanLimits = require("../constants/freePlanLimits");
const { UserDuplicate } = require("../errors/user.error");
const UserModel = require("../models/user.model");
const { getHashedString } = require("./hashing.service");

exports.registerUser = async ({ email, password, name, attributes = {} }) => {
  const existingUser = await UserModel.findByEmailId(email);
  if (existingUser) throw new UserDuplicate();
  const hashedPassword = await getHashedString(password);
  const registeredUser = await UserModel.create({
    email,
    password: hashedPassword,
    name,
    attributes,
  });
  return registeredUser;
};

exports.createLoggedInUserWithPlanAndLimits = ({
  user,
  activatedPlan,
  limits,
}) => {
  return {
    email: user.email,
    name: user.name,
    _id: user._id,
    googleId: user.googleId,
    currentPlan: activatedPlan,
    limits,
  };
};

exports.getLimitsForActivePlan = (activatedPlan) => {
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
  const limits = planLimits[activatedPlan.plan];
  return limits;
};
