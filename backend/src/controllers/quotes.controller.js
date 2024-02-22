const { isValidObjectId, default: mongoose } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Quote = require("../models/quotes.model");
const { QuoteNotFound } = require("../errors/quote.error");
const { quoteDto } = require("../dto/quotes.dto");
const getTotalAndTax = (items = []) => {
  const total = items.reduce(
    (prev, item) => prev + item.rate * item.quantity,
    0
  );
  const totalTax = items.reduce((prev, item) => {
    const taxPercentage =
      item.gst === "none" ? 0 : parseInt(item.gst.split(":")[1]);
    return prev + (item.rate * item.quantity * taxPercentage) / 100;
  }, 0);
  return { total, totalTax };
};
exports.createQuote = requestAsyncHandler(async (req, res) => {
  const { total, totalTax } = getTotalAndTax(req.body.items);
  const body = await quoteDto.validateAsync(req.body);
  const newQuote = new Quote({
    org: req.params.orgId,
    ...body,
    total,
    totalTax,
  });
  await newQuote.save();
  return res.status(201).json({ message: "Quote created !", quote: newQuote });
});

exports.updateQuote = requestAsyncHandler(async (req, res) => {
  const { total, totalTax } = getTotalAndTax(req.body.items);
  const body = await quoteDto.validateAsync(req.body);

  const updatedQuote = await Quote.findOneAndUpdate(
    { _id: req.params.quoteId, org: req.params.orgId },
    {
      ...body,
      total,
      totalTax,
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
  return res.status(200).json({ message: "Quote deleted !" });
});

exports.getQuotes = requestAsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search;
  if (search) filter.$text = { $search: search };
  const quotes = await Quote.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
  const totalCount = await Quote.countDocuments(filter).exec();
  const totalPages = Math.ceil(totalCount / limit);
  return res.status(200).json({
    data: quotes,
    totalCount,
    limit,
    skip,
    totalPages,
    message: "Quotes retrived successfully",
  });
});

exports.getQuote = requestAsyncHandler(async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.quoteId,
    org: req.params.orgId,
  })
    .populate("customer")
    .populate("createdBy", "name email _id");
  if (!quote) throw new QuoteNotFound();
  return res.status(200).json({ data: quote });
});
