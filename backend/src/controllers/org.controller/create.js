const expenseCategories = require("../../constants/expenseCategories");
const { createOrgDto } = require("../../dto/org.dto");
const logger = require("../../logger");
const ExpenseCategory = require("../../models/expenseCategory.model");
const Org = require("../../models/org.model");
const OrgUser = require("../../models/orgUser.model");
const Setting = require("../../models/settings.model");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");

const create = async (req, res) => {
  const body = await createOrgDto.validateAsync(req.body);
  const organization = new Org(body);
  organization.relatedDocsCount.organizationUsers = 1;
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
  if (
    activatedPlan &&
    activatedPlan.plan === "gold" &&
    countOfOrganizationByUser >= 3
  )
    return res
      .status(400)
      .json({ message: "Please upgrade your plan to platinum" });
  organization.relatedDocsCount.expenseCategories = expenseCategories.length;

  const newOrg = await organization.save();
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
    expenseCategories.map((category) => ({
      ...category,
      org: newOrg.id,
      enabled: true,
    }))
  );

  return res
    .status(201)
    .json({ message: "Organization registered", data: organization });
};

module.exports = create;
