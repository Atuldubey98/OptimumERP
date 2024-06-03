const currencies = require("../constants/currencies");
const taxRates = require("../constants/gst");
const ums = require("../constants/um");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");

const calculateTaxes = (items = []) => {
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
exports.saveBill = async ({
  dto,
  Bill,
  requestBody,
  Duplicate,
  NotFound,
  prefixType = "quotation",
  billId,
}) => {
  const body = await dto.validateAsync(requestBody);
  const totalWithTaxes = calculateTaxes(body.items);
  const setting = await getSettingForOrg(body.org);
  const billBody = {
    ...body,
    ...totalWithTaxes,
  };
  const transaction = {
    org: body.org,
    createdBy: body.createdBy,
    docModel: Bill.modelName,
    financialYear: setting.financialYear,
    date: body.date,
    total: totalWithTaxes.total,
    totalTax: totalWithTaxes.totalTax,
    party: body.party,
  };
  switch (Bill.modelName) {
    case "quotes":
      const prefix = setting.transactionPrefix[prefixType];
      const existingBill = await Bill.findOne({
        org: body.org,
        sequence: body.sequence,
        financialYear: setting.financialYear,
        ...(billId && { _id: { $ne: billId } }),
      });
      if (existingBill) throw new Duplicate(existingBill.num);
      billBody.num = prefix + body.sequence;
      billBody.prefix = prefix;
      billBody.financialYear = setting.financialYear;
      transaction.docModel = Bill.modelName;
      break;
    default:
      break;
  }
  const bill = billId
    ? await Bill.findOneAndUpdate(
        {
          _id: billId,
          org: body.org,
        },
        billBody,
        {
          new: true,
        }
      )
    : await new Bill(billBody).save();
  if (billId && !bill) throw new NotFound();
  transaction.doc = bill.id;
  const newTransaction = new Transaction(transaction);
  await newTransaction.save();
  return bill;
};

exports.deleteBill = async ({ Bill, NotFound, filter }) => {
  const bill = await Bill.findOneAndDelete(filter);
  if (!bill) throw new NotFound();
  const transaction = await Transaction.findOneAndDelete({
    org: filter.org,
    docModel: Bill.modelName,
    doc: filter._id,
  });
  if (!transaction) throw new NotFound();
  return bill;
};

exports.getNextSequence = async ({ Bill, org }) => {
  const setting = await getSettingForOrg(org);
  const bill = await Bill.findOne(
    {
      org,
      financialYear: setting.financialYear,
    },
    { sequence: 1 },
    { sort: { sequence: -1 } }
  ).select("sequence");
  return bill ? bill.sequence + 1 : 1;
};

exports.getBillDetail = async ({ Bill, filter }) => {
  const bill = await Bill.findOne(filter)
    .populate("party")
    .populate("createdBy", "name email _id")
    .populate("org");
  const setting = await Setting.findOne({
    org: filter.org,
  });
  const currencySymbol = currencies[setting.currency].symbol;
  const grandTotal = bill.total + bill.totalTax;
  const items = bill.items.map(({ name, price, quantity, gst, um }) => ({
    name,
    quantity,
    gst: taxRates.find((taxRate) => taxRate.value === gst).label,
    um: ums.find((unit) => unit.value === um).label,
    price: `${currencySymbol} ${price.toFixed(2)}`,
    total: `${currencySymbol} ${(
      price *
      quantity *
      ((100 + (gst === "none" ? 0 : parseFloat(gst.split(":")[1]))) / 100)
    ).toFixed(2)}`,
  }));
  const data = {
    entity: bill,
    num: bill.num,
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    items,
    bank: null,
    upiQr: null,
    currencySymbol,
    total: `${currencySymbol} ${bill.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${bill.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${bill.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${bill.igst.toFixed(2)}`,
  };
  switch (Bill.modelName) {
    case "quotes":
      const quote = {
        ...data,
        title: "Quotation",
        billMetaHeading: "Estimate Information",
        partyMetaHeading: "Estimate to",
      };
      return quote;
    default:
      return data;
  }
};
