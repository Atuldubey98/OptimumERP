const { OrgNotFound } = require("../../errors/org.error");
const Invoice = require("../../models/invoice.model");
const OrgModel = require("../../models/org.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const Setting = require("../../models/settings.model");
const Transaction = require("../../models/transaction.model");

const convertProformaToInvoice = async (req, res) => {
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const proformaInvoice = await ProformaInvoice.findOne({
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
    total: proformaInvoice.total,
    num,
    sequence,
    totalTax: proformaInvoice.totalTax,
    prefix: invoicePrefix,
    igst: proformaInvoice.igst,
    sgst: proformaInvoice.sgst,
    cgst: proformaInvoice.cgst,
    financialYear: setting.financialYear,
    billingAddress: proformaInvoice.billingAddress,
    description: proformaInvoice.description,
    items: proformaInvoice.items,
    party: proformaInvoice.party._id,
    date: new Date(date.toDateString()),
    poDate: proformaInvoice.date,
    poNo: proformaInvoice.poNo,
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
    num: newInvoice.num,
    doc: newInvoice._id,
    total: proformaInvoice.total,
    totalTax: proformaInvoice.totalTax,
    party: proformaInvoice.party._id,
    date: newInvoice.date,
    createdBy: req.session.user._id,
  });
  await transaction.save();
  await ProformaInvoice.updateOne(
    { _id: req.params.id },
    { $set: { converted: newInvoice.id } }
  );
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.invoices": 1 } }
  );
  return res.status(201).json({ message: `Invoice ${num} created` });
};

module.exports = convertProformaToInvoice;
