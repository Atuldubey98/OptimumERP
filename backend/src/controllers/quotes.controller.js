const { isValidObjectId, default: mongoose } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Quote = require("../models/quotes.model");
const { QuoteNotFound, QuotationDuplicate } = require("../errors/quote.error");
const { PartyNotFound } = require("../errors/party.error");
const { quoteDto } = require("../dto/quotes.dto");
const Party = require("../models/party.model");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const ejs = require("ejs");
const wkhtmltopdf = require("wkhtmltopdf");
const taxRates = require("../constants/gst");
const ums = require("../constants/um");
const currencies = require("../constants/currencies");
const path = require("path");
const Invoice = require("../models/invoice.model");
const OrgModel = require("../models/org.model");
const { getPaginationParams } = require("../helpers/crud.helper");
const config = require("../constants/config");

exports.getTotalAndTax = (items = []) => {
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
exports.createQuote = requestAsyncHandler(async (req, res) => {
  const body = await quoteDto.validateAsync(req.body);
  const { total, totalTax, sgst, cgst, igst } = this.getTotalAndTax(
    req.body.items
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const party = await Party.findOne({
    _id: body.party,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  const existingQuotation = await Quote.findOne({
    org: req.params.orgId,
    sequence: body.sequence,
    financialYear: setting.financialYear,
  });
  if (existingQuotation) throw new QuotationDuplicate(existingQuotation.num);
  const prefix = setting.transactionPrefix.quotation;

  const newQuote = new Quote({
    org: req.params.orgId,
    ...body,
    total,
    totalTax,
    num: prefix + body.sequence,
    prefix,
    financialYear: setting.financialYear,
    sgst,
    cgst,
    igst,
  });
  await newQuote.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "quotes",
    financialYear: setting.financialYear,
    doc: newQuote._id,
    date: newQuote.date,
    total,
    totalTax,
    party: body.party,
  });
  await transaction.save();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.quotes": 1 } }
  );
  return res.status(201).json({ message: "Quote created !", data: newQuote });
});

exports.updateQuote = requestAsyncHandler(async (req, res) => {
  const { total, totalTax, sgst, igst, cgst } = this.getTotalAndTax(
    req.body.items
  );
  const body = await quoteDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const existingQuotation = await Quote.findOne({
    org: req.params.orgId,
    sequence: body.sequence,
    _id: { $ne: req.params.quoteId },
    financialYear: setting.financialYear,
  });
  if (existingQuotation) throw new QuotationDuplicate(existingQuotation.num);
  const updatedQuote = await Quote.findOneAndUpdate(
    { _id: req.params.quoteId, org: req.params.orgId },
    {
      ...body,
      total,
      num: body.prefix + body.sequence,
      prefix: body.prefix,
      totalTax,
      cgst,
      igst,
      sgst,
    }
  );
  await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "quotes",
      doc: updatedQuote.id,
    },
    {
      updatedBy: req.body.updatedBy,
      total,
      totalTax,
      party: body.party,
      date: updatedQuote.date,
    }
  );
  if (!updatedQuote) throw new QuoteNotFound();
  return res.status(200).json({ message: "Quote updated !" });
});

exports.deleteQuote = requestAsyncHandler(async (req, res) => {
  const quoteId = req.params.quoteId;
  if (!isValidObjectId(quoteId)) throw new QuoteNotFound();
  const quote = await Quote.findOneAndDelete({
    _id: quoteId,
    org: req.params.orgId,
  });
  if (!quote) throw new QuoteNotFound();
  const transaction = await Transaction.findOneAndDelete({
    org: req.params.orgId,
    docModel: "quotes",
    doc: quoteId,
  });
  if (!transaction) throw new QuoteNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.quotes": -1 } }
  );
  return res.status(200).json({ message: "Quote deleted !" });
});

exports.getQuotes = requestAsyncHandler(async (req, res) => {
  const { filter, limit, skip, page, total, totalPages } =
    await getPaginationParams({
      req,
      model: Quote,
      modelName: config.QUOTATION,
    });
  const quotes = Quote.find(filter)
    .populate("party")
    .populate("org")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  return res.status(200).json({
    data: quotes,
    page: page,
    limit: limit,
    total,
    totalPages,
    message: "Quotes retrieved successfully",
  });
});

exports.getQuote = requestAsyncHandler(async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.quoteId,
    org: req.params.orgId,
  })
    .populate("party", "name _id")
    .populate("createdBy", "name email _id")
    .populate("org", "name address _id");
  if (!quote) throw new QuoteNotFound();
  return res.status(200).json({ data: quote });
});

exports.getNextQuotationNumber = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ org: req.params.orgId });
  const quote = await Quote.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { sequence: 1 },
    { sort: { sequence: -1 } }
  ).select("sequence");
  return res.status(200).json({ data: quote ? quote.sequence + 1 : 1 });
});

exports.viewQuote = requestAsyncHandler(async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.quoteId,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email _id")
    .populate("org");
  const grandTotal = quote.items.reduce(
    (total, quoteItem) =>
      total +
      (quoteItem.price *
        quoteItem.quantity *
        (100 +
          (quoteItem.gst === "none"
            ? 0
            : parseFloat(quoteItem.gst.split(":")[1])))) /
        100,
    0
  );
  const templateName = req.query.template || "simple";
  const locationTemplate = `templates/${templateName}`;
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;

  const items = quote.items.map(({ name, price, quantity, gst, um }) => ({
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
    entity: quote,
    num: quote.num,
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    items,
    bank: null,
    upiQr: null,
    currencySymbol,
    total: `${currencySymbol} ${quote.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${quote.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${quote.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${quote.igst.toFixed(2)}`,
    title: "Quotation",
    billMetaHeading: "Estimate Information",
    partyMetaHeading: "Estimate to",
  };
  return res.render(locationTemplate, data);
});

exports.downloadQuote = requestAsyncHandler(async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.quoteId,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email _id")
    .populate("org");
  const grandTotal = quote.items.reduce(
    (total, quoteItem) =>
      total +
      (quoteItem.price *
        quoteItem.quantity *
        (100 +
          (quoteItem.gst === "none"
            ? 0
            : parseFloat(quoteItem.gst.split(":")[1])))) /
        100,
    0
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;

  const items = quote.items.map(({ name, price, quantity, gst, um, code }) => ({
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
  }));

  const data = {
    entity: quote,
    num: quote.num,
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    items,
    bank: null,
    upiQr: null,
    currencySymbol,
    total: `${currencySymbol} ${quote.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${quote.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${quote.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${quote.igst.toFixed(2)}`,
    title: "Quotation",
    billMetaHeading: "Estimate Information",
    partyMetaHeading: "Estimate to",
  };
  const templateName = req.query.template || "simple";
  const locationTemplate = path.join(
    __dirname,
    `../views/templates/${templateName}/index.ejs`
  );
  ejs.renderFile(locationTemplate, data, (err, html) => {
    if (err) throw err;
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-disposition": `attachment;filename=quote - ${quote.date}.pdf`,
    });
    wkhtmltopdf(html, {
      enableLocalFileAccess: true,
      pageSize: "A4",
    }).pipe(res);
  });
});

exports.convertQuoteToInvoice = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const quote = await Quote.findOne({
    org: req.params.orgId,
    _id: req.params.quoteId,
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
  await Quote.updateOne(
    { _id: req.params.quoteId },
    { $set: { converted: newInvoice.id } }
  );
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.invoices": 1 } }
  );
  return res.status(201).json({ message: `Invoice ${num} created` });
});
