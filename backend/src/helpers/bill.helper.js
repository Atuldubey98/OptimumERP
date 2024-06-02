const entitiesConfig = require("../constants/entities");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");

const getTotalAndTax = (items = []) => {
  const total = items.reduce(
    (prev, item) => prev + item.price * item.quantity,
    0
  );
  let cgst = 0,
    sgst = 0,
    igst = 0;

  const totalTax = items.reduce((prev, item) => {
    const [typeOfGST, gstPercentage] = item.gst.split(":");
    const taxPercentage = item.gst === "none" ? 0 : parseInt(gstPercentage);
    const tax = prev + (item.price * item.quantity * taxPercentage) / 100;
    cgst += typeOfGST === "GST" ? tax / 2 : 0;
    sgst += typeOfGST === "GST" ? tax / 2 : 0;
    igst += typeOfGST === "IGST" ? tax : 0;
    return tax;
  }, 0);
  return {
    total: parseFloat(total.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    cgst,
    sgst,
    igst,
  };
};
const getSettingForOrg = async (org) => {
  const setting = await Setting.findOne({
    org,
  });
  if (!setting) throw new OrgNotFound();
  return setting;
};
exports.createBill = async ({
  dto,
  Bill,
  requestBody,
  Duplicate,
  billType = "quotes",
  prefixType = "quotation",
}) => {
  const body = await dto.validateAsync(requestBody);
  const totalWithTaxes = getTotalAndTax(body.items);
  const setting = await getSettingForOrg(body.org);
  const bill = {
    ...body,
    ...totalWithTaxes,
  };
  const transaction = {
    org: body.org,
    createdBy: body.createdBy,
    docModel: billType,
    financialYear: setting.financialYear,
    date: body.date,
    total: totalWithTaxes.total,
    totalTax: totalWithTaxes.totalTax,
    party: body.party,
  };
  switch (billType) {
    case "quotes":
      const prefix = setting.transactionPrefix[prefixType];
      const existingQuotation = await Bill.findOne({
        org: body.org,
        sequence: body.sequence,
        financialYear: setting.financialYear,
      });
      if (existingQuotation) throw new Duplicate(existingQuotation.num);
      bill.num = prefix + body.sequence;
      bill.prefix = prefix;
      bill.financialYear = setting.financialYear;
      transaction.docModel = billType;
      break;
    default:
      break;
  }
  const newBill = new Bill(bill);
  await newBill.save();
  transaction.doc = newBill.id;
  const newTransaction = new Transaction(transaction);
  await newTransaction.save();
  return bill;
};
