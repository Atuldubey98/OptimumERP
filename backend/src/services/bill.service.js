const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const { currencyToWordConverter } = require("./currencyToWord.service");
const propertyService = require("./property.service");
const { promiseQrCode, renderHtml } = require("./renderEngine.service");
const {
  calculateTaxes,
  calculateTaxesForBillItemsWithCurrency,
} = require("./taxCalculator.service");
const path = require("path");
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
  session,
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
      const { existingBill, prefix } = await findExistingBillInFinancialYear();
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
        session
      }
    )
    : await new Bill(billBody).save({session});
  if (billId && !bill) throw new NotFound();
  transaction.doc = bill.id;
  const newTransaction = new Transaction(transaction);
  await newTransaction.save({
    session
  })
  return bill;

  async function findExistingBillInFinancialYear() {
    const prefix = setting.transactionPrefix[prefixType];
    const existingBill = await Bill.findOne({
      org: body.org,
      sequence: body.sequence,
      financialYear: setting.financialYear,
      ...(billId && { _id: { $ne: billId } }),
    });
    return { existingBill, prefix };
  }
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
      if(taxValue === 0) return prev;
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
  const currencies = await propertyService.getCurrencyConfig();
  const currencySymbol = currencies.value[setting.currency].symbol;
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
    currencyTaxCategories,
  };

  const billMetaMapping = {
    quotes: async () => {
      return {
        title: "Quotation",
        billMetaHeading: "Estimate Details",
        partyMetaHeading: "Estimate to",
      };
    },
    purchase: async () => {
      return {
        title: "Purchase",
        billMetaHeading: "Purchase Details",
        partyMetaHeading: "Bill From",
      };
    },
    proforma_invoice: async () => {
      return {
        title: "Proforma Invoice",
        billMetaHeading: "Proforma Invoice Details",
        partyMetaHeading: "Bill To",
      };
    },
    purchase_order: async () => {
      return {
        title: "Purchase Orders",
        billMetaHeading: "PO Details",
        partyMetaHeading: "PO to",
      };
    },
    invoice: async () => {
      const upiQr = await getUpiQrCodeByPrintSettings({
        upi: bill.org?.bank?.upi,
        grandTotal,
        shouldPrintQr: setting?.printSettings?.upiQr,
      });
      const bank = setting?.printSettings?.bank & bill.org.bank ? bill.org.bank : null;
      return {
        title: "Invoice",
        billMetaHeading: "Invoice Details",
        partyMetaHeading: "Bill To",
        bank,
        upiQr,
      };
    },
  };
  const getBillMeta = billMetaMapping[Bill.modelName];
  if (!getBillMeta) return data;
  const meta = await getBillMeta();
  return { ...data, ...meta };
};

exports.convertBillToHtmlByTemplate = async ({
  Bill,
  filter,
  NotFound,
  template,
}) => {
  const data = await this.getBillDetail({
    Bill,
    filter,
    NotFound,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  return { html, data };
};
