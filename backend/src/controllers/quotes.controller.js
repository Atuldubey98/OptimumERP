const { isValidObjectId, default: mongoose } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Quote = require("../models/quotes.model");
const { QuoteNotFound, QuotationDuplicate } = require("../errors/quote.error");
const { CustomerNotFound } = require("../errors/customer.error");
const { quoteDto } = require("../dto/quotes.dto");
const Customer = require("../models/customer.model");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");

exports.getTotalAndTax = (items = []) => {
  const total = items.reduce(
    (prev, item) => prev + item.price * item.quantity,
    0
  );
  const totalTax = items.reduce((prev, item) => {
    const taxPercentage =
      item.gst === "none" ? 0 : parseInt(item.gst.split(":")[1]);
    return prev + (item.price * item.quantity * taxPercentage) / 100;
  }, 0);
  return { total, totalTax };
};
exports.createQuote = requestAsyncHandler(async (req, res) => {
  const { total, totalTax } = this.getTotalAndTax(req.body.items);
  const body = await quoteDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const customer = await Customer.findOne({
    _id: body.customer,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
  const existingQuotation = await Quote.findOne({
    org: req.params.orgId,
    quoteNo: body.quoteNo,
    financialYear: setting.financialYear,
  });
  const transactionPrefix = setting.transactionPrefix.quotation;
  if (existingQuotation) throw QuotationDuplicate(req.params.quoteNo);
  
  const newQuote = new Quote({
    org: req.params.orgId,
    ...body,
    total,
    totalTax,
    num: transactionPrefix + body.quoteNo,
    financialYear: setting.financialYear,
  });
  await newQuote.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "quotes",
    financialYear: setting.financialYear,
    doc: newQuote._id,
  });
  await transaction.save();
  return res.status(201).json({ message: "Quote created !", data: newQuote });
});

exports.updateQuote = requestAsyncHandler(async (req, res) => {
  const { total, totalTax } = this.getTotalAndTax(req.body.items);
  const body = await quoteDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const transactionPrefix = setting.transactionPrefix.quotation;

  const updatedQuote = await Quote.findOneAndUpdate(
    { _id: req.params.quoteId, org: req.params.orgId },
    {
      ...body,
      total,
      num: transactionPrefix + body.quoteNo,
      totalTax,
    }
  );
  const updateTransaction = await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "quotes",
      doc: updatedQuote.id,
    },
    { updatedBy: req.body.updatedBy }
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
  return res.status(200).json({ message: "Quote deleted !" });
});

exports.getQuotes = requestAsyncHandler(async (req, res) => {
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

  const quotesQuery = Quote.find(filter).populate("customer").populate("org");

  const totalCount = await Quote.countDocuments(filter);

  const quotes = await quotesQuery
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  return res.status(200).json({
    data: quotes,
    page: page,
    limit: limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    message: "Quotes retrieved successfully",
  });
});

exports.getQuote = requestAsyncHandler(async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.quoteId,
    org: req.params.orgId,
  })
    .populate("customer", "name _id")
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
    { quoteNo: 1 },
    { sort: { quoteNo: -1 } }
  ).select("quoteNo");
  return res.status(200).json({ data: quote ? quote.quoteNo + 1 : 1 });
});

exports.downloadQuote = requestAsyncHandler(async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.quoteId,
    org: req.params.orgId,
  })
    .populate("customer")
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
  return res.render("pdf/quote", {
    title: `Quotation-${quote.quoteNo}-${quote.date}`,
    quote,
    grandTotal,
  });
});
