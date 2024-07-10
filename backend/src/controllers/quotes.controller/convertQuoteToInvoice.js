const { OrgNotFound } = require("../../errors/org.error");
const Invoice = require("../../models/invoice.model");
const OrgModel = require("../../models/org.model");
const Quotes = require("../../models/quotes.model");
const Setting = require("../../models/settings.model");
const Transaction = require("../../models/transaction.model");

const convertQuoteToInvoice = async (req, res) => {
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const quote = await Quotes.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  }).populate("party");
  const invoicePrefix = setting.transactionPrefix.invoice;
  const invoice = await Invoice.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { sequence: 1 },
    { sort: { sequence: -1 } }
  ).select("sequence");
  const sequence = (invoice?.sequence || 0) + 1;
  const num = invoicePrefix + sequence;
  const date = new Date();
  const newInvoice = new Invoice({
    org: req.params.orgId,
    total: quote.total,
    num,
    sequence,
    prefix: invoicePrefix,
    totalTax: quote.totalTax,
    igst: quote.igst,
    sgst: quote.sgst,
    cgst: quote.cgst,
    financialYear: setting.financialYear,
    billingAddress: quote.billingAddress,
    description: quote.description,
    items: quote.items,
    party: quote.party._id,
    date: new Date(date.toDateString()),
    poDate: quote.date,
    poNo: quote.quoteNo,
    createdBy: req.session.user._id,
    status: "draft",
    terms: "Thanks for business !",
  });
  await newInvoice.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "invoice",
    financialYear: setting.financialYear,
    doc: newInvoice._id,
    total: quote.total,
    num: newInvoice.num,
    totalTax: quote.totalTax,
    party: quote.party._id,
    date: newInvoice.date,
    createdBy: req.session.user._id,
  });
  await transaction.save();
  await Quotes.updateOne(
    { _id: req.params.id },
    { $set: { converted: newInvoice.id } }
  );
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.invoices": 1 } }
  );
  return res.status(201).json({ message: `Invoice ${num} created` });
};

module.exports = convertQuoteToInvoice;