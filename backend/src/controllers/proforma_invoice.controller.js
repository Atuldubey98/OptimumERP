const { isValidObjectId } = require("mongoose");
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
const { getTotalAndTax } = require("./quotes.controller");
const currencies = require("../constants/currencies");
const taxRates = require("../constants/gst");
const ums = require("../constants/um");
const path = require("path");
const ejs = require("ejs");
const wkhtmltopdf = require("wkhtmltopdf");
const Invoice = require("../models/invoice.model");
const Transaction = require("../models/transaction.model");
const OrgModel = require("../models/org.model");
const { getPaginationParams } = require("../helpers/crud.helper");
const config = require("../constants/config");
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
    sequence: body.sequence,
    financialYear: setting.financialYear,
  });
  if (existingInvoice) throw new ProformaInvoiceDuplicate(body.sequence);
  const prefix = setting.transactionPrefix.proformaInvoice || "";
  const newProformaInvoice = new ProformaInvoice({
    org: req.params.orgId,
    ...body,
    total,
    num: prefix + body.sequence,
    prefix,
    totalTax,
    igst,
    sgst,
    cgst,
    financialYear: setting.financialYear,
  });
  await newProformaInvoice.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "proforma_invoice",
    financialYear: setting.financialYear,
    doc: newProformaInvoice._id,
    total,
    totalTax,
    party: body.party,
    date: newProformaInvoice.date,
  });
  await transaction.save();
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
      modelName: config.PROFORMA_INVOICES,
      model: ProformaInvoice,
    });
  const invoices = await ProformaInvoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

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
    { sequence: 1 },
    { sort: { sequence: -1 } }
  ).select("sequence");
  return res.status(200).json({ data: invoice ? invoice.sequence + 1 : 1 });
});

exports.deleteProformaInvoice = requestAsyncHandler(async (req, res) => {
  const proformaInvoice = await ProformaInvoice.findOneAndDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });
  if (!proformaInvoice) throw new ProformaInvoiceNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.proformaInvoices": -1 } }
  );
  await Transaction.findOneAndDelete({
    org: req.params.orgId,
    docModel: "proforma_invoice",
    doc: proformaInvoice.id,
  });
  return res.status(200).json({ message: "Proforma invoice deleted." });
});

exports.updateProformaInvoice = requestAsyncHandler(async (req, res) => {
  const { total, totalTax, cgst, sgst, igst } = getTotalAndTax(req.body.items);
  const body = await proformaInvoiceDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  }).select("transactionPrefix financialYear");
  if (!setting) throw new OrgNotFound();
  if (!setting) throw new OrgNotFound();
  const existingInvoiceFilter = {
    org: req.params.orgId,
    _id: { $ne: req.params.id },
    sequence: body.sequence,
    financialYear: setting.financialYear,
  };
  const existingInvoice = await ProformaInvoice.findOne(existingInvoiceFilter);
  if (existingInvoice) throw new ProformaInvoiceDuplicate(existingInvoice.num);
  const updatedInvoice = await ProformaInvoice.findOneAndUpdate(
    { _id: req.params.id, org: req.params.orgId },
    {
      ...body,
      total,
      num: body.prefix + body.sequence,
      prefix: body.prefix,
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
  await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "proforma_invoice",
      doc: updatedInvoice.id,
    },
    {
      updatedBy: req.body.updatedBy,
      total,
      totalTax,
      party: body.party,
      num: body.prefix + body.sequence,
      date: updatedInvoice.date,
    }
  );
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
  if (!isValidObjectId(id)) throw new InvoiceNotFound();
  const templateName = req.query.template || "simple";
  const locationTemplate = `templates/${templateName}`;
  const invoice = await ProformaInvoice.findOne({
    _id: id,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo bank");
  if (!invoice) throw new ProformaInvoiceNotFound();
  const grandTotal = (invoice.items || []).reduce(
    (total, invoiceItem) =>
      total +
      (invoiceItem.price *
        invoiceItem.quantity *
        (100 +
          (invoiceItem.gst === "none"
            ? 0
            : parseFloat(invoiceItem.gst.split(":")[1])))) /
        100,
    0
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;
  const bank = setting.printSettings.bank && invoice.org.bank;
  const items = invoice.items.map(
    ({ name, price, quantity, gst, um, code }) => ({
      name,
      quantity,
      code,
      gst: taxRates.find((taxRate) => taxRate.value === gst).label,
      um: ums.find((unit) => unit.value === um).label,
      price: `${currencySymbol} ${price.toFixed(2)}`,
      total: `${currencySymbol} ${(
        price *
        quantity *
        ((100 + (gst === "none" ? 0 : parseFloat(gst.split(":")[1]))) / 100)
      ).toFixed(2)}`,
    })
  );
  return res.render(locationTemplate, {
    entity: invoice,
    num: invoice.num,
    items,
    bank,
    upiQr: null,
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    total: `${currencySymbol} ${invoice.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${invoice.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${invoice.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${invoice.igst.toFixed(2)}`,
    title: "Proforma Invoice",
    billMetaHeading: "Proforma Invoice information",
    partyMetaHeading: "Bill To",
  });
});

exports.downloadProformaInvoice = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new ProformaInvoiceNotFound();
  const templateName = req.query.template || "simple";
  const locationTemplate = path.join(
    __dirname,
    `../views/templates/${templateName}/index.ejs`
  );
  const invoice = await ProformaInvoice.findOne({
    _id: id,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo bank");
  const grandTotal = invoice.items.reduce(
    (total, invoiceItem) =>
      total +
      (invoiceItem.price *
        invoiceItem.quantity *
        (100 +
          (invoiceItem.gst === "none"
            ? 0
            : parseFloat(invoiceItem.gst.split(":")[1])))) /
        100,
    0
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;

  const items = invoice.items.map(
    ({ name, price, quantity, gst, um, code }) => ({
      name,
      quantity,
      code,
      gst: taxRates.find((taxRate) => taxRate.value === gst).label,
      um: ums.find((unit) => unit.value === um).label,
      price: `${currencySymbol} ${price.toFixed(2)}`,
      total: `${currencySymbol} ${(
        price *
        quantity *
        ((100 + (gst === "none" ? 0 : parseFloat(gst.split(":")[1]))) / 100)
      ).toFixed(2)}`,
    })
  );
  const bank = setting.printSettings.bank && invoice.org.bank;
  ejs.renderFile(
    locationTemplate,
    {
      entity: invoice,
      num: invoice.num,
      items,
      upiQr: null,
      bank,
      grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
      total: `${currencySymbol} ${invoice.total.toFixed(2)}`,
      sgst: `${currencySymbol} ${invoice.sgst.toFixed(2)}`,
      cgst: `${currencySymbol} ${invoice.cgst.toFixed(2)}`,
      igst: `${currencySymbol} ${invoice.igst.toFixed(2)}`,
      title: "Invoice",
      billMetaHeading: "Invoice information",
      partyMetaHeading: "Bill To",
    },
    (err, html) => {
      if (err) throw err;
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-disposition": `attachment;filename=invoice - ${invoice.date}.pdf`,
      });
      wkhtmltopdf(html, {
        enableLocalFileAccess: true,
        pageSize: "A4",
      }).pipe(res);
    }
  );
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
