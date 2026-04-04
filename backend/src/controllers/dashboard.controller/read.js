const { isValidObjectId } = require("mongoose");
const Invoice = require("../../models/invoice.model");
const Quotes = require("../../models/quotes.model");
const { OrgNotFound } = require("../../errors/org.error");
const Party = require("../../models/party.model");
const Expense = require("../../models/expense.model");
const Purchase = require("../../models/purchase.model");

const buildDateBoundary = (dateString, isEndOfDay = false) => {
  if (!dateString || typeof dateString !== "string") return null;

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;

  return isEndOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
};

const read = async (req, res) => {
  const { startDate, endDate } = req.query;
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();

  const normalizedStartDate = buildDateBoundary(startDate);
  const normalizedEndDate = buildDateBoundary(endDate, true);
  const dateFilter =
    normalizedStartDate && normalizedEndDate
      ? {
          $gte: normalizedStartDate,
          $lte: normalizedEndDate,
        }
      : undefined;

  const entityFilter = {
    org: orgId,
    ...(dateFilter ? { date: dateFilter } : {}),
  };
  const partyFilter = {
    org: orgId,
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };

  const [invCount, quoCount, expCount, purCount, partiesCount] = await Promise.all([
    Invoice.countDocuments(entityFilter),
    Quotes.countDocuments(entityFilter),
    Expense.countDocuments(entityFilter),
    Purchase.countDocuments(entityFilter),
    Party.countDocuments(partyFilter),
  ]);
 
  const counts = {
    invoices: invCount,
    quotes: quoCount,
    expenses: expCount,
    purchases: purCount,
    parties: partiesCount,
  };
  const recentEntities = [Invoice, Quotes, Purchase];
  const [invoices, quotes, purchases] = await Promise.all(
    recentEntities.map((model) =>
      model
        .find(entityFilter)
        .sort({ date: -1, createdAt: -1 })
        .select("name num total totalTax status party date num")
        .populate("party", "name")
        .limit(5)
        .lean()
        .exec()
    )
  );
  return res.status(200).json({
    data: {
      counts,
      tables: {
        invoices,
        quotes,
        purchases,
      },
    },
  });
};

module.exports = read;
