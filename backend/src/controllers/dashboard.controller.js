const { isValidObjectId } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Invoice = require("../models/invoice,.model");
const Quotes = require("../models/quotes.model");
const { OrgNotFound } = require("../errors/org.error");
const Customer = require("../models/customer.model");
exports.getDashboard = requestAsyncHandler(async (req, res) => {
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const invoiceThisMonth = await Invoice.countDocuments({
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
    org: orgId,
  });
  const quotesThisMonth = await Quotes.countDocuments({
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
    org: orgId,
  });
  const customersThisMonth = await Customer.countDocuments({
    createdAt: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
    org: orgId,
  });
  const recentInvoices = await Invoice.find({ org: orgId })
    .sort({ createdAt: -1 })
    .select("name invoiceNo total totalTax status customer date")
    .populate("customer", "name")
    .limit(5)
    .exec();
  const recentQuotes = await Quotes.find({ org: orgId })
    .sort({ createdAt: -1 })
    .select("name quoteNo total totalTax status customer date")
    .populate("customer", "name")
    .limit(5)
    .exec();
  return res.status(200).json({
    data: {
      invoiceThisMonth,
      quotesThisMonth,
      customersThisMonth,
      recentInvoices,
      recentQuotes,
    },
  });
});
