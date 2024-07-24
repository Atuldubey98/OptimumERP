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
  organization.relatedDocsCount.organizationUsers = 1;
  organization.relatedDocsCount.expenseCategories = expenseCategories.length;
  const orgUser = new OrgUser({
    org: organization.id,
    user: req.session.user._id,
    role: "admin",
  });

  await orgUser.save();
  const defaultOrgEntitiesPromises = [
    createDefaultUnits(req.session?.user?._id, organization),
    createDefaultTaxes(req.session?.user?._id, organization),
    createDefaultExpenseCategories(organization),
  ];
  const [ums, taxes] = await Promise.all(defaultOrgEntitiesPromises);
  const setting = new Setting({
    org: organization.id,
    financialYear: body.financialYear,
    receiptDefaults: {
      tax: taxes[0].id,
      um: ums[0].id,
    },
  });

  await setting.save();
  logger.info(`Organization created with id ${organization.id}`);
  organization.relatedDocsCount.ums = ums.length;
  organization.relatedDocsCount.taxes = taxes.length;
  await organization.save();
  return res
    .status(201)
    .json({ message: "Organization registered", data: organization });
};

module.exports = create;

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
  for (let i = 0; i < groupableTaxesSGSTCGST.length; i += 2) {
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
  return Tax.insertMany(
    taxes.map((tax) => ({
      ...tax,
      createdBy: userId,
      org: organization.id,
    }))
  );
}

async function createDefaultUnits(userId, organization) {
  const ums = await Um.insertMany(
    defaultUms.map((um) => ({
      ...um,
      createdBy: userId,
      org: organization.id,
    }))
  );
  return ums;
}

async function createDefaultExpenseCategories(newOrg) {
  await ExpenseCategory.insertMany(
    expenseCategories.map((category) => ({
      ...category,
      org: newOrg.id,
      enabled: true,
    }))
  );
}
