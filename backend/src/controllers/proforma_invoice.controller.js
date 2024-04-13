const proformaInvoiceDto = require("../dto/proform_invoice.dto");
const { OrgNotFound } = require("../errors/org.error");
const { PartyNotFound } = require("../errors/party.error");
const {
  ProformaInvoiceDuplicate,
  ProformaInvoiceNotDelete,
  ProformaInvoiceNotFound,
} = require("../errors/proforma_invoice.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Party = require("../models/party.model");
const ProformaInvoice = require("../models/proforma_invoice.model");
const Setting = require("../models/settings.model");
exports.createProformaInvoice = requestAsyncHandler(async (req, res) => {
  const body = await proformaInvoiceDto.validateAsync(req.body);
  const { total, totalTax, igst, sgst, cgst } = getTotalAndTax(body.items);
  const party = await Party.findOne({
    _id: body.party,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const existingInvoice = await ProformaInvoice.findOne({
    org: req.params.orgId,
    proformaInvoicecNo: body.proformaInvoiceNo,
    financialYear: setting.financialYear,
  });
  if (existingInvoice) throw ProformaInvoiceDuplicate(body.proformaInvoiceNo);
  const proformaInvoicePrefix = setting.transactionPrefix.proformaInvoice || "";
  const newProformaInvoice = new ProformaInvoice({
    org: req.params.orgId,
    ...body,
    total,
    num: proformaInvoicePrefix + body.proformaInvoiceNo,
    totalTax,
    igst,
    sgst,
    cgst,
    financialYear: setting.financialYear,
  });
  await newProformaInvoice.save();
  return res
    .status(200)
    .json({ message: "Proforma Invoice created", data: newProformaInvoice });
});

exports.getProformaInvoices = requestAsyncHandler(async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (req.query.startDate && req.query.endDate) {
    filter.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const invoices = await ProformaInvoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await ProformaInvoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    data: invoices,
    page,
    limit,
    totalPages,
    total,
  });
});
exports.getNextProformaInvoiceNo = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ org: req.params.orgId });
  const invoice = await ProformaInvoice.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { proformaInvoiceNo: 1 },
    { sort: { proformaInvoiceNo: -1 } }
  ).select("proformaInvoiceNo");
  return res
    .status(200)
    .json({ data: invoice ? invoice.proformaInvoicecNo + 1 : 1 });
});

exports.deleteProformaInvoice = requestAsyncHandler(async (req, res) => {
  const proformaInvoice = await ProformaInvoice.findOneAndDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });
  if (!proformaInvoice) throw new ProformaInvoiceNotFound();
  return res.status(200).json({ message: "Proforma invoice deleted." });
});

exports.updateProformaInvoice = requestAsyncHandler(async (req, res) => {
  const { total, totalTax, cgst, sgst, igst } = getTotalAndTax(req.body.items);
  const body = await proformaInvoiceDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  }).select("transactionPrefix");
  if(!setting) throw new OrgNotFound();
  const proformaInvoicePrefix = setting.transactionPrefix.proformaInvoice || "";

  if (!setting) throw new OrgNotFound();
  const updatedInvoice = await ProformaInvoice.findOneAndUpdate(
    { _id: req.params.id, org: req.params.orgId },
    {
      ...body,
      total,
      num: proformaInvoicePrefix + body.invoiceNo,
      totalTax,
      sgst,
      cgst,
      igst,
    },
    {
      new: true,
    }
  );
  if (!updatedInvoice) throw new ProformaInvoiceNotFound();
  return res
    .status(200)
    .json({ message: "Invoice updated !", data: updatedInvoice });
});
