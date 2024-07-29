const { registerUserDto } = require("../../dto/user.dto");
const OrgModel = require("../../models/org.model");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const OrgUser = require("../../models/orgUser.model");
const logger = require("../../logger");
const { registerUser } = require("../../services/auth.service");

const createOrgUser = async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const registeredUser = await registerUser(body);
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
  org.relatedDocsCount.organizationUsers++;
  await org.save();
  logger.info(`Organization user created with id ${orgUser.id}`);
  return res
    .status(201)
    .json({ message: "User registered successfully for organization" });
};

module.exports = createOrgUser;
