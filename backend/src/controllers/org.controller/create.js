const defaultUms = require("../../constants/defaultUms");
const expenseCategories = require("../../constants/expenseCategories");
const taxes = require("../../constants/taxes");
const { createOrgDto } = require("../../dto/org.dto");
const logger = require("../../logger");
const ExpenseCategory = require("../../models/expenseCategory.model");
const Org = require("../../models/org.model");
const OrgUser = require("../../models/orgUser.model");
const Setting = require("../../models/settings.model");
const Tax = require("../../models/tax.model");
const Um = require("../../models/um.model");

const create = async (req, res) => {
  const body = await createOrgDto.validateAsync(req.body);
  const organization = new Org(body);
  organization.relatedDocsCount.expenseCategories = expenseCategories.length;
  const userId = req.session?.user?._id;
  await createOrgUserForOrganization(userId, organization);
  organization.relatedDocsCount.organizationUsers++;
  const defaultOrgEntitiesPromises = [
    createDefaultUnits(userId, organization),
    createDefaultTaxes(userId, organization),
    createDefaultExpenseCategories(userId, organization),
  ];
  const [ums, taxes] = await Promise.all(defaultOrgEntitiesPromises);
  const noneTypeTax = taxes[0].id;
  const noneTypeUm = ums[0].id;
  await createSettingForOrg({
    organization,
    body,
    receiptDefaults: {
      tax: noneTypeTax,
      um: noneTypeUm,
    },
  });
  logger.info(`Organization created with id ${organization.id}`);
  organization.relatedDocsCount.ums = ums.length;
  organization.relatedDocsCount.taxes = taxes.length;
  await organization.save();
  return res
    .status(201)
    .json({ message: "Organization registered", data: organization });
};

module.exports = create;

function createSettingForOrg({ organization, body, receiptDefaults }) {
  const setting = new Setting({
    org: organization.id,
    financialYear: body.financialYear,
    receiptDefaults,
  });

  return setting.save();
}

function createOrgUserForOrganization(userId, organization) {
  const orgUser = new OrgUser({
    org: organization.id,
    user: userId,
    role: "admin",
  });

  return orgUser.save();
}

async function createDefaultTaxes(userId, organization) {
  const singleTaxes = await createDefaultSingleTypeTaxes(userId, organization);
  const groupedTaxes = getGroupedTaxesFromSingleTaxes({
    singleTaxes,
    organization,
    userId,
  });
  const groupTaxes = await Tax.insertMany(groupedTaxes);
  return [...singleTaxes, ...groupTaxes];
}

function getGroupedTaxesFromSingleTaxes({ singleTaxes, organization, userId }) {
  const filterSGSTCGST = (singleTax) =>
    singleTax.category === "sgst" || singleTax.category === "cgst";
  const groupableTaxesSGSTCGST = singleTaxes.filter(filterSGSTCGST);
  const groupedTaxes = [];
  const ALTERNATE_INDEX = 2;
  const STARTING_INDEX = 0;
  const totalTaxes = groupableTaxesSGSTCGST.length;
  for (let i = STARTING_INDEX; i < totalTaxes; i += ALTERNATE_INDEX) {
    const sgst = groupableTaxesSGSTCGST[i];
    const cgst = groupableTaxesSGSTCGST[i + 1];
    groupedTaxes.push({
      name: `GST@${sgst.percentage + cgst.percentage}`,
      description: `GST@${sgst.percentage}`,
      type: "grouped",
      category: "others",
      percentage: sgst.percentage + cgst.percentage,
      children: [sgst.id, cgst.id],
      org: organization.id,
      createdBy: userId,
    });
  }
  return groupedTaxes;
}

async function createDefaultSingleTypeTaxes(userId, organization) {
  const makeTaxForOrg = (tax) => ({
    ...tax,
    createdBy: userId,
    org: organization.id,
  });
  return Tax.insertMany(taxes.map(makeTaxForOrg));
}

async function createDefaultUnits(userId, organization) {
  const makeUmForOrg = (um) => ({
    ...um,
    createdBy: userId,
    org: organization.id,
  });
  const ums = await Um.insertMany(defaultUms.map(makeUmForOrg));
  return ums;
}

async function createDefaultExpenseCategories(userId, newOrg) {
  const makeExpenseCategoryForOrg = (category) => ({
    ...category,
    org: newOrg.id,
    createdBy: userId,
    enabled: true,
  });
  return ExpenseCategory.insertMany(
    expenseCategories.map(makeExpenseCategoryForOrg)
  );
}
