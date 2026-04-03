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
const { getDisplaySettingForOrg } = require("./setting.service");
const path = require("path");
const MODEL_NAME_TO_COUNTER_KEY = {
  invoice: "invoice",
  quotes: "quotation",
  purchase_order: "purchaseOrder",
  proforma_invoice: "proformaInvoice",
  sale_order: "saleOrder",
};

const getUpiQrCodeByPrintSettings = async ({
  upi,
  grandTotal = 0,
  shouldPrintQr = false,
}) => {
  const upiUrl = `upi://pay?pa=${upi}&am=${grandTotal}`;
  const upiQr = shouldPrintQr && upi ? await promiseQrCode(upiUrl) : null;
  return upiQr;
};

const getLiveSettingForOrg = async (org, session) => {
  const setting = await Setting.findOne(
    {
      org,
    },
    null,
    session ? { session } : undefined
  );
  if (!setting) throw new OrgNotFound();
  return setting;
};

const getCounterKey = ({ Bill, prefixType }) => {
  if (prefixType) return prefixType;
  return MODEL_NAME_TO_COUNTER_KEY[Bill?.modelName];
};

const getCounterPath = (counterKey) => `sequenceCounters.${counterKey}`;

const getHighestSequence = async ({ Bill, org, financialYear, session }) => {
  const bill = await Bill.findOne(
    {
      org,
      financialYear,
    },
    { sequence: 1 },
    { sort: { sequence: -1 }, ...(session ? { session } : {}) }
  );
  return bill?.sequence || 0;
};

const syncSequenceCounter = async ({ org, counterKey, sequence, session }) => {
  if (!counterKey || typeof sequence !== "number") return;
  await Setting.updateOne(
    { org },
    {
      $max: {
        [getCounterPath(counterKey)]: sequence,
      },
    },
    session ? { session } : undefined
  );
};

const getCurrentSequenceCounter = async ({ Bill, org, prefixType, session }) => {
  const setting = await getLiveSettingForOrg(org, session);
  const counterKey = getCounterKey({ Bill, prefixType });
  if (!counterKey) {
    const highestSequence = await getHighestSequence({
      Bill,
      org,
      financialYear: setting.financialYear,
      session,
    });
    return { setting, counterKey: null, currentCounter: highestSequence };
  }

  const storedCounter = setting.sequenceCounters?.[counterKey];
  if (typeof storedCounter === "number") {
    return { setting, counterKey, currentCounter: storedCounter };
  }

  const highestSequence = await getHighestSequence({
    Bill,
    org,
    financialYear: setting.financialYear,
    session,
  });
  await syncSequenceCounter({
    org,
    counterKey,
    sequence: highestSequence,
    session,
  });
  return { setting, counterKey, currentCounter: highestSequence };
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
  const totalWithTaxes = await calculateTaxes(body.items, body.org);
  const { setting, counterKey } = await getCurrentSequenceCounter({
    Bill,
    org: body.org,
    prefixType,
    session,
  });
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
  await Transaction.findOneAndUpdate(
    {
      org: transaction.org,
      docModel: transaction.docModel,
      doc: bill.id,
    },
    transaction,
    {
      upsert: true,
      new: true,
      session,
    }
  );

  await syncSequenceCounter({
    org: body.org,
    counterKey,
    sequence: body.sequence,
    session,
  });

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
  const bill = await Bill.softDelete(filter);
  if (!bill) throw new NotFound();
  const transaction = await Transaction.softDelete({
    org: filter.org,
    docModel: Bill.modelName,
    doc: filter._id,
  });
  if (!transaction) throw new NotFound();
  return bill;
};

exports.getNextSequence = async ({ Bill, org, prefixType, session }) => {
  const { currentCounter } = await getCurrentSequenceCounter({
    Bill,
    org,
    prefixType,
    session,
  });
  return currentCounter + 1;
};

exports.reserveNextSequence = async ({ Bill, org, prefixType, session }) => {
  const { counterKey } = await getCurrentSequenceCounter({
    Bill,
    org,
    prefixType,
    session,
  });
  if (!counterKey) {
    return exports.getNextSequence({ Bill, org, prefixType, session });
  }

  const updatedSetting = await Setting.findOneAndUpdate(
    { org },
    {
      $inc: {
        [getCounterPath(counterKey)]: 1,
      },
    },
    {
      new: true,
      ...(session ? { session } : {}),
    }
  );
  if (!updatedSetting) throw new OrgNotFound();
  return updatedSetting.sequenceCounters[counterKey];
};

exports.syncSequenceCounter = async ({ Bill, org, prefixType, sequence, session }) => {
  const counterKey = getCounterKey({ Bill, prefixType });
  return syncSequenceCounter({ org, counterKey, sequence, session });
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
exports.getBillDetail = async ({ Bill, filter, NotFound, t, language }) => {
  const bill = await Bill.findOne(filter)
    .populate("party")
    .populate("createdBy", "name email _id")
    .populate("org");
  if (!bill) throw new NotFound();
  const setting = await getDisplaySettingForOrg(filter.org);
  const currencies = await propertyService.getCurrencyConfig();
  const currencySymbol = currencies.value[setting.currency].symbol;
  const grandTotal = bill.total + bill.totalTax;
  const items = await calculateTaxesForBillItemsWithCurrency(
    bill.items,
    currencySymbol,
    filter.org,
  );
  const localeCode = setting.localeCode;
  const dateLocale = language
    ? language.toLowerCase().startsWith("pt")
      ? "pt-PT"
      : "en-IN"
    : localeCode || "en-IN";
  const currencyTaxCategories = addCurrencyToTaxCategories(
    bill.taxCategories,
    currencySymbol
  );
  const translateTemplateLabel = (key, defaultValue) =>
    t ? t(`billing:template_labels.${key}`, { defaultValue }) : defaultValue;
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
    dateLocale,
    metaLabels: {
      tax_invoice: translateTemplateLabel("tax_invoice", "Tax Invoice"),
      phone: translateTemplateLabel("phone", "Phone"),
      email: translateTemplateLabel("email", "Email"),
      state: translateTemplateLabel("state", "State"),
      gstin: translateTemplateLabel("gstin", "GSTIN"),
      pan: translateTemplateLabel("pan", "PAN"),
      invoice_no: translateTemplateLabel("invoice_no", "Invoice No."),
      invoice_date: translateTemplateLabel("invoice_date", "Invoice Date"),
      po_number: translateTemplateLabel("po_number", "PO Number"),
      po_date: translateTemplateLabel("po_date", "PO Date"),
      date: translateTemplateLabel("date", "Date"),
      number: translateTemplateLabel("number", "Number"),
      po_no: translateTemplateLabel("po_no", "PO No"),
      item_details: translateTemplateLabel("item_details", "Item Details"),
      serial_no: translateTemplateLabel("serial_no", "Sno."),
      item: translateTemplateLabel("item", "Item"),
      items: translateTemplateLabel("items", "Items"),
      hsn_sac_code: translateTemplateLabel("hsn_sac_code", "HSN/SAC Code"),
      um: translateTemplateLabel("um", "UM"),
      rate: translateTemplateLabel("rate", "Rate"),
      qty: translateTemplateLabel("qty", "Qty"),
      tax: translateTemplateLabel("tax", "Tax"),
      amount: translateTemplateLabel("amount", "Amount"),
      product: translateTemplateLabel("product", "Product"),
      price: translateTemplateLabel("price", "Price"),
      total: translateTemplateLabel("total", "Total"),
      subtotal: translateTemplateLabel("subtotal", "Subtotal"),
      grand_total: translateTemplateLabel("grand_total", "Grand Total"),
      amount_in_words: translateTemplateLabel("amount_in_words", "Amount in words"),
      terms_and_conditions: translateTemplateLabel("terms_and_conditions", "Terms and Conditions"),
      company_bank_details: translateTemplateLabel("company_bank_details", "Company Bank details"),
      bank_account_details: translateTemplateLabel("bank_account_details", "Bank Account Details"),
      bank_name: translateTemplateLabel("bank_name", "Bank Name"),
      bank_account_no: translateTemplateLabel("bank_account_no", "Bank Account No."),
      bank_ifsc_code: translateTemplateLabel("bank_ifsc_code", "Bank IFSC code"),
      account_holder_name: translateTemplateLabel("account_holder_name", "Account holder name"),
      account_holder: translateTemplateLabel("account_holder", "Account Holder"),
      account_number: translateTemplateLabel("account_number", "Account Number"),
      ifsc_code: translateTemplateLabel("ifsc_code", "IFSC Code"),
      upi_qr_code: translateTemplateLabel("upi_qr_code", "UPI QR Code"),
      authorized_signatory: translateTemplateLabel("authorized_signatory", "Authorized Signatory"),
      invoice_hash: translateTemplateLabel("invoice_hash", "Invoice #"),
      date_issued: translateTemplateLabel("date_issued", "Date Issued"),
      billing_from: translateTemplateLabel("billing_from", "Billing From"),
      billing_to: translateTemplateLabel("billing_to", "Billing To"),
      address: translateTemplateLabel("address", "Address"),
      tax_upper: translateTemplateLabel("tax_upper", "TAX"),
      total_upper: translateTemplateLabel("total_upper", "TOTAL"),
    },
  };

  const billMetaMapping = {
    quotes: async () => {
      return {
        title: t
          ? t("billing:bill_metadata:quotation_title", {
            defaultValue: "Quotation",
          })
          : "Quotation",
        billMetaHeading: t
          ? t("billing:bill_metadata:quotation_meta_heading", {
            defaultValue: "Estimate Details",
          })
          : "Estimate Details",
        partyMetaHeading: t
          ? t("billing:bill_metadata:quotation_party_heading", {
            defaultValue: "Estimate to",
          })
          : "Estimate to",
      };
    },
    purchase: async () => {
      return {
        title: t
          ? t("billing:bill_metadata:purchase_title", {
            defaultValue: "Purchase",
          })
          : "Purchase",
        billMetaHeading: t
          ? t("billing:bill_metadata:purchase_meta_heading", {
            defaultValue: "Purchase Details",
          })
          : "Purchase Details",
        partyMetaHeading: t
          ? t("billing:bill_metadata:purchase_party_heading", {
            defaultValue: "Bill From",
          })
          : "Bill From",
      };
    },
    proforma_invoice: async () => {
      return {
        title: t
          ? t("billing:bill_metadata:proforma_invoice_title", {
            defaultValue: "Proforma Invoice",
          })
          : "Proforma Invoice",
        billMetaHeading: t
          ? t("billing:bill_metadata:proforma_invoice_meta_heading", {
            defaultValue: "Proforma Invoice Details",
          })
          : "Proforma Invoice Details",
        partyMetaHeading: t
          ? t("billing:bill_metadata:proforma_invoice_party_heading", {
            defaultValue: "Bill To",
          })
          : "Bill To",
      };
    },
    purchase_order: async () => {
      return {
        title: t
          ? t("billing:bill_metadata:purchase_order_title", {
            defaultValue: "Purchase Order",
          })
          : "Purchase Order",
        billMetaHeading: t
          ? t("billing:bill_metadata:purchase_order_meta_heading", {
            defaultValue: "PO Details",
          })
          : "PO Details",
        partyMetaHeading: t
          ? t("billing:bill_metadata:purchase_order_party_heading", {
            defaultValue: "PO to",
          })
          : "PO to",
      };
    },
    invoice: async () => {
      const upiQr = await getUpiQrCodeByPrintSettings({
        upi: bill.org?.bank?.upi,
        grandTotal,
        shouldPrintQr: setting?.printSettings?.upiQr,
      });
      
      const bank = setting?.printSettings?.bank && bill.org.bank ? bill.org.bank : null;      
      return {
        title: t
          ? t("billing:bill_metadata:invoice_title", {
            defaultValue: "Tax Invoice",
          })
          : "Tax Invoice",
        billMetaHeading: t
          ? t("billing:bill_metadata:invoice_meta_heading", {
            defaultValue: "Invoice Details",
          })
          : "Invoice Details",
        partyMetaHeading: t
          ? t("billing:bill_metadata:invoice_party_heading", {
            defaultValue: "Bill To",
          })
          : "Bill To",
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
  t,
  language,
}) => {
  const data = await this.getBillDetail({
    Bill,
    filter,
    NotFound,
    t,
    language,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  return { html, data };
};
