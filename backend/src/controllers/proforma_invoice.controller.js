const { isValidObjectId } = require("mongoose");
const proformaInvoiceDto = require("../dto/proform_invoice.dto");
const { OrgNotFound } = require("../errors/org.error");
const {
  ProformaInvoiceDuplicate,
  ProformaInvoiceNotFound,
} = require("../errors/proforma_invoice.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const ProformaInvoice = require("../models/proforma_invoice.model");
const Setting = require("../models/settings.model");
const path = require("path");
const Invoice = require("../models/invoice.model");
const Transaction = require("../models/transaction.model");
const OrgModel = require("../models/org.model");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../helpers/crud.helper");
const entitiesConfig = require("../constants/entities");
const {
  saveBill,
  getNextSequence,
  getBillDetail,
  deleteBill,
} = require("../helpers/bill.helper");
const logger = require("../logger");
const {
  sendHtmlToPdfResponse,
  renderHtml,
} = require("../helpers/render_engine.helper");

exports.createProformaInvoice = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const newProformaInvoice = await saveBill({
    Bill: ProformaInvoice,
    dto: proformaInvoiceDto,
    Duplicate: ProformaInvoiceDuplicate,
    NotFound: ProformaInvoiceNotFound,
    requestBody,
    prefixType: "proformaInvoice",
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.proformaInvoices": 1 } }
  );
  return res
    .status(200)
    .json({ message: "Proforma Invoice created", data: newProformaInvoice });
});

exports.getProformaInvoices = requestAsyncHandler(async (req, res) => {
  const { filter, skip, limit, page, totalPages, total } =
    await getPaginationParams({
      req,
      modelName: entitiesConfig.PROFORMA_INVOICES,
      model: ProformaInvoice,
    });
  const proformaInvoices = await ProformaInvoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  return res.status(200).json({
    data: proformaInvoices,
    page,
    limit,
    totalPages,
    total,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "proformaInvoices",
    }),
  });
});
exports.getNextProformaInvoiceNo = requestAsyncHandler(async (req, res) => {
  const nextSequence = await getNextSequence({
    Bill: ProformaInvoice,
    org: req.params.orgId,
  });
  return res.status(200).json({ data: nextSequence });
});

exports.deleteProformaInvoice = requestAsyncHandler(async (req, res) => {
  const filter = {
    _id: req.params.id,
    org: req.params.orgId,
  };
  await deleteBill({
    Bill: ProformaInvoice,
    NotFound: ProformaInvoiceNotFound,
    filter,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.proformaInvoices": -1 } }
  );
  await Transaction.findOneAndDelete({
    org: req.params.orgId,
    docModel: "proforma_invoice",
    doc: req.params.id,
  });
  return res.status(200).json({ message: "Proforma invoice deleted." });
});

exports.updateProformaInvoice = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new ProformaInvoiceNotFound();
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const updatedInvoice = await saveBill({
    Bill: ProformaInvoice,
    dto: proformaInvoiceDto,
    Duplicate: ProformaInvoiceDuplicate,
    NotFound: ProformaInvoiceNotFound,
    requestBody,
    prefixType: "proformaInvoice",
    billId: id,
  });
  logger.info(`Proforma updated ${updatedInvoice.id}`);
  return res
    .status(200)
    .json({ message: "Invoice updated !", data: updatedInvoice });
});

exports.getProformaInvoiceById = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new ProformaInvoiceNotFound();
  const invoice = await ProformaInvoice.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  })
    .populate("party", "name _id")
    .populate("createdBy", "name email _id")
    .populate("org", "name address _id");
  if (!invoice) throw new ProformaInvoiceNotFound();
  return res.status(200).json({ data: invoice });
});

exports.viewProformaInvoicce = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new ProformaInvoiceNotFound();
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const template = req.query.template || "simple";
  const locationTemplate = `templates/${template}`;
  const data = await getBillDetail({
    Bill: ProformaInvoice,
    filter,
    NotFound: ProformaInvoiceNotFound,
  });
  return res.render(locationTemplate, data);
});

exports.downloadProformaInvoice = requestAsyncHandler(async (req, res) => {
  const template = req.query.template || "simple";
  const id = req.params.id;
  const data = await getBillDetail({
    Bill: ProformaInvoice,
    filter: {
      _id: id,
      org: req.params.orgId,
    },
    NotFound: ProformaInvoiceNotFound,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `Proforma Invoice-${data.num}-${data.date}.pdf`,
  });
});

exports.convertProformaToInvoice = requestAsyncHandler(async (req, res) => {
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
});
