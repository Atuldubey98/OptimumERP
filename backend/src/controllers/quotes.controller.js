const { isValidObjectId } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Quote = require("../models/quotes.model");
const { QuoteNotFound, QuotationDuplicate } = require("../errors/quote.error");
const { quoteDto } = require("../dto/quotes.dto");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const path = require("path");
const Invoice = require("../models/invoice.model");
const OrgModel = require("../models/org.model");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../helpers/crud.helper");
const entitiesConfig = require("../constants/entities");
const {
  saveBill,
  deleteBill,
  getNextSequence,
  getBillDetail,
} = require("../helpers/bill.helper");
const {
  renderHtml,
  sendHtmlToPdfResponse,
} = require("../helpers/render_engine.helper");

exports.createQuote = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const bill = await saveBill({
    dto: quoteDto,
    requestBody,
    billType: "quotes",
    Duplicate: QuotationDuplicate,
    Bill: Quote,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.quotes": 1 } }
  );
  return res.status(201).json({ message: "Quote created !", data: bill });
});

exports.updateQuote = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const billId = req.params.quoteId;
  if (!isValidObjectId(billId)) throw new QuoteNotFound();

  const bill = await saveBill({
    dto: quoteDto,
    requestBody,
    billType: "quotes",
    Duplicate: QuotationDuplicate,
    NotFound: QuoteNotFound,
    Bill: Quote,
    billId,
  });
  return res.status(200).json({ message: "Quote updated !", data: bill });
});

exports.deleteQuote = requestAsyncHandler(async (req, res) => {
  const quoteId = req.params.quoteId;
  if (!isValidObjectId(quoteId)) throw new QuoteNotFound();
  await deleteBill({
    Bill: Quote,
    NotFound: QuoteNotFound,
    billType: "quotes",
    filter: { _id: quoteId, org: req.params.orgId },
  });
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
      modelName: entitiesConfig.QUOTATION,
    });
  const quotes = await Quote.find(filter)
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
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "quotes",
    }),
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
  const nextSequence = await getNextSequence({
    org: req.params.orgId,
    Bill: Quote,
  });
  return res.status(200).json({ data: nextSequence });
});

exports.viewQuote = async (req, res) => {
  try {
    const filter = {
      _id: req.params.quoteId,
      org: req.params.orgId,
    };
    const template = req.query.template || "simple";
    const locationTemplate = `templates/${template}`;
    const data = await getBillDetail({
      Bill: Quote,
      filter,
      NotFound: QuoteNotFound,
    });
    return res.render(locationTemplate, data);
  } catch (error) {
    return res.render(`templates/error`);
  }
};

exports.downloadQuote = requestAsyncHandler(async (req, res) => {
  const template = req.query.template || "simple";
  const data = await getBillDetail({
    Bill: Quote,
    filter: {
      _id: req.params.quoteId,
      org: req.params.orgId,
    },
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `Quotation-${data.num}-${data.date}.pdf`,
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
