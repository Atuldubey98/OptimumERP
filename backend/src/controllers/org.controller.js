const { createOrgDto } = require("../dto/org.dto");
const { registerUserDto } = require("../dto/user.dto");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Org = require("../models/org.model");
const User = require("../models/user.model");
const OrgUser = require("../models/org_user.model");
const UserActivatedPlan = require("../models/user_activated_plans");
const bcryptjs = require("bcryptjs");
const { UserDuplicate } = require("../errors/user.error");
const logger = require("../logger");
const Setting = require("../models/settings.model");
const ExpenseCategory = require("../models/expense_category");
const expenseCategories = require("../constants/expense_categories");
const OrgModel = require("../models/org.model");
exports.createOrg = requestAsyncHandler(async (req, res) => {
  const body = await createOrgDto.validateAsync(req.body);
  const organization = new Org(body);
  const newOrg = await organization.save();
  const activatedPlan = await UserActivatedPlan.findOne({
    user: req.session.user._id,
  });
  const countOfOrganizationByUser = await OrgUser.countDocuments({
    user: req.session.user._id,
    role: "admin",
  });
  if (
    activatedPlan &&
    activatedPlan.plan === "free" &&
    countOfOrganizationByUser === 1
  )
    return res
      .status(400)
      .json({ message: "Please upgrade your plan to gold" });
  const orgUser = new OrgUser({
    org: newOrg.id,
    user: req.session.user._id,
    role: "admin",
  });
  const setting = new Setting({
    org: newOrg.id,
    financialYear: body.financialYear,
  });
  await setting.save();
  await orgUser.save();
  logger.info(`Organization created with id ${newOrg.id}`);
  await ExpenseCategory.insertMany(
    expenseCategories.map((category) => ({ ...category, org: newOrg.id }))
  );
  return res
    .status(201)
    .json({ message: "Organization registered", data: organization });
});

exports.getOrg = requestAsyncHandler(async (req, res) => {
  const userId = req.session.user._id;
  const org = await Org.findByIdAndUserId(userId, req.params.orgId);
  if (!org) throw new OrgNotFound();
  return res.status(200).json({ data: org });
});

exports.createNewUserForOrg = requestAsyncHandler(async (req, res) => {
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
  });
  const orgUser = new OrgUser({
    org: req.params.orgId,
    user: registeredUser.id,
    role: body.role,
  });
  await orgUser.save();

  logger.info(`Organization user created with id ${orgUser.id}`);
  return res
    .status(201)
    .json({ message: "User registered successfully for organization" });
});

exports.getOrgsOfUser = requestAsyncHandler(async (req, res) => {
  const organizations = await OrgUser.find({
    user: req.session.user._id,
  })
    .populate("org")
    .select("org role");
  return res.status(200).json({ data: organizations });
});

exports.getAllUsersOfOrganization = requestAsyncHandler(async (req, res) => {
  const organizationUsers = await OrgUser.find({
    org: req.params.orgId,
  })
    .populate("org")
    .populate("user", "name email active role");
  return res.status(200).json({ data: organizationUsers });
});

exports.updateOrganizationUser = requestAsyncHandler(async (req, res) => {
  const organizationUser = await OrgUser.findOneAndUpdate(
    {
      org: req.params.orgId,
      user: req.params.userId,
    },
    req.body,
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json({ data: organizationUser, message: "User updated" });
});

exports.updateOrganization = requestAsyncHandler(async (req, res) => {
  const updatedOrg = await Org.findByIdAndUpdate(req.params.orgId, req.body, {
    new: true,
  });
  return res
    .status(200)
    .json({ message: "Details updated !", data: updatedOrg });
});
