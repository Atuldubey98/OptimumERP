const currencies = require("../constants/currencies");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const { currencyToWordConverter } = require("./currencyToWord.service");
const { promiseQrCode } = require("./renderEngine.service");
const {
  calculateTaxes,
  calculateTaxesForBillItemsWithCurrency,
} = require("./taxCalculator.service");
const getUpiQrCodeByPrintSettings = async ({
  upi,
  grandTotal = 0,
  shouldPrintQr = false,
}) => {
  const upiUrl = `upi://pay?pa=${upi}&am=${grandTotal}`;
  const upiQr = shouldPrintQr && upi ? await promiseQrCode(upiUrl) : null;
  return upiQr;
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
  const totalWithTaxes = await calculateTaxes(body.items);
  const setting = await getSettingForOrg(body.org);
  const billBody = {
    ...body,
    ...totalWithTaxes,
    financialYear: setting.financialYear,
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
    docModel: Bill.modelName,
  };
  switch (Bill.modelName) {
    case "purchase":
      break;
    case "invoice":
    case "proforma_invoice":
    case "purchase_order":
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
  );
  return bill ? (bill?.sequence || 0) + 1 : 1;
};
const addCurrencyToTaxCategories = (taxCategories = {}, currencySymbol) => {
  const newTaxCategories = Object.entries(taxCategories).reduce(
    (prev, current) => {
      const [taxType, taxValue = 0] = current;
      prev[taxType] = `${currencySymbol} ${taxValue.toFixed(2)}`;
      return prev;
    },
    {}
  );
  return newTaxCategories;
};
exports.getBillDetail = async ({ Bill, filter, NotFound }) => {
  const bill = await Bill.findOne(filter)
    .populate("party")
    .populate("createdBy", "name email _id")
    .populate("org");
  if (!bill) throw new NotFound();
  const setting = await getSettingForOrg(filter.org);
  const currencySymbol = currencies[setting.currency].symbol;
  const grandTotal = bill.total + bill.totalTax;
  const items = await calculateTaxesForBillItemsWithCurrency(
    bill.items,
    currencySymbol
  );
  const localeCode = setting.localeCode;
  const currencyTaxCategories = addCurrencyToTaxCategories(
    bill.taxCategories,
    currencySymbol
  );
  const data = {
    entity: bill,
    num: bill.num,
    items,
    bank: null,
    upiQr: null,
    currencySymbol,
    amountToWords: currencyToWordConverter(localeCode, grandTotal),
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    total: `${currencySymbol} ${bill.total.toFixed(2)}`,
    ...currencyTaxCategories,
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
    case "purchase":
      const purchase = {
        ...data,
        title: "Purchase",
        billMetaHeading: "Purchase Information",
        partyMetaHeading: "Bill From",
      };
      return purchase;
    case "proforma_invoice":
      const proformaInvoice = {
        ...data,
        title: "Proforma Invoice",
        billMetaHeading: "Proforma Invoice information",
        partyMetaHeading: "Bill To",
      };
      return proformaInvoice;
    case "purchase_order":
      const purchaseOrder = {
        ...data,
        title: "Purchase Orders",
        billMetaHeading: "PO Information",
        partyMetaHeading: "PO to",
      };
      return purchaseOrder;
    case "invoice":
      const upiQr = await getUpiQrCodeByPrintSettings({
        upi: bill.org?.bank?.upi,
        grandTotal,
        shouldPrintQr: setting.printSettings.upiQr,
      });
      const bank = setting.printSettings.bank && bill.org.bank;
      const invoice = {
        ...data,
        title: "Invoice",
        billMetaHeading: "Invoice information",
        partyMetaHeading: "Bill To",
        bank,
        upiQr,
      };
      return invoice;
    default:
      return data;
  }
};
