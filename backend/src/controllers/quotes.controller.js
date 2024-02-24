const { isValidObjectId, default: mongoose } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Quote = require("../models/quotes.model");
const { QuoteNotFound } = require("../errors/quote.error");
const { CustomerNotFound } = require("../errors/customer.error");
const { quoteDto } = require("../dto/quotes.dto");
const Customer = require("../models/customer.model");

const ejs = require("ejs");
const getTotalAndTax = (items = []) => {
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
  const { total, totalTax } = getTotalAndTax(req.body.items);
  const body = await quoteDto.validateAsync(req.body);
  const customer = await Customer.findOne({
    _id: body.customer,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
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
  
  const quotes = await Quote.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .populate("org")
    .exec();

  return res.status(200).json({
    data: quotes,
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
  const quote = await Quote.findOne(
    {
      org: req.params.orgId,
    },
    { quoteNo: 1 },
    { sort: { quoteNo: -1 } }
  ).select("quoteNo");
  return res.status(200).json({ data: quote ? quote.quoteNo + 1 : 1 });
});

exports.viewQuote = requestAsyncHandler(async (req, res) => {
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
