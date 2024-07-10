const { registerUserDto } = require("../../dto/user.dto");
const { UserDuplicate } = require("../../errors/user.error");
const OrgModel = require("../../models/org.model");
const User = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const OrgUser = require("../../models/orgUser.model");
const logger = require("../../logger");

const createOrgUser = async (req, res) => {
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
  const org = await OrgModel.findById(req.params.orgId);
  await UserActivatedPlan.create({
    user: registeredUser.id,
    plan: req.session?.user?.currentPlan?.plan,
    purchasedBy: org.createdBy,
    expiresOn: req.session?.user.currentPlan?.expiresOn,
    purchasedOn: req.session?.user.currentPlan?.purchasedOn,
  });
  const orgUser = new OrgUser({
    org: req.params.orgId,
    user: registeredUser.id,
    role: body.role,
  });
  await orgUser.save();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.organizationUsers": 1 } }
  );
  logger.info(`Organization user created with id ${orgUser.id}`);
  return res
    .status(201)
    .json({ message: "User registered successfully for organization" });
};

module.exports = createOrgUser;
