const { isValidObjectId } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Invoice = require("../models/invoice.model");
const Quotes = require("../models/quotes.model");
const { OrgNotFound } = require("../errors/org.error");
const Party = require("../models/party.model");
const Expense = require("../models/expense.model");
const Purchase = require("../models/purchase.model");
exports.getDashboard = requestAsyncHandler(async (req, res) => {
  const currentDate = new Date();
  let startDate, endDate;

  const { period } = req.query;
  switch (period) {
    case "lastWeek":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      break;
    case "lastMonth":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      break;
    case "lastYear":
      startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
  }

  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const countEntitiesPromises = [Invoice, Quotes, Party, Expense, Purchase];
  const [
    invoiceThisMonth,
    quotesThisMonth,
    partysThisMonth,
    expensesThisMonth,
    purchasesThisMonth,
  ] = await Promise.all(
    countEntitiesPromises.map((model) =>
      model.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        org: orgId,
      })
    )
  );
  const recentEntities = [Invoice, Quotes, Purchase];
  const [recentInvoices, recentQuotes, recentPurchases] = await Promise.all(
    recentEntities.map((model) =>
      model
        .find({ org: orgId })
        .sort({ createdAt: -1 })
        .select("name num total totalTax status party date num")
        .populate("party", "name")
        .limit(5)
        .exec()
    )
  );
  return res.status(200).json({
    data: {
      invoiceThisMonth,
      quotesThisMonth,
      recentPurchases,
      expensesThisMonth,
      partysThisMonth,
      recentInvoices,
      recentQuotes,
      purchasesThisMonth,
    },
  });
});
