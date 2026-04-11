const { isValidObjectId } = require("mongoose");
const Invoice = require("../models/invoice.model");
const Quotes = require("../models/quotes.model");
const Party = require("../models/party.model");
const Expense = require("../models/expense.model");
const Purchase = require("../models/purchase.model");

const buildDateBoundary = (dateString, isEndOfDay = false) => {
  if (!dateString || typeof dateString !== "string") return null;

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;

  return isEndOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
};
async function getLastBills(recentEntities, billFilter) {
  return await Promise.all(
    recentEntities.map((model) =>
      model
        .find(billFilter)
        .sort({ date: -1, createdAt: -1 })
        .select("name num total totalTax shippingCharges status party date num")
        .limit(5)
        .populate("party", "name")
        .lean()
        .exec(),
    ),
  );
}
async function getCountsByFilter(billFilter, partyFilter) {
  const [invCount, quoCount, expCount, purCount, partiesCount] =
    await Promise.all([
      Invoice.countDocuments(billFilter),
      Quotes.countDocuments(billFilter),
      Expense.countDocuments(billFilter),
      Purchase.countDocuments(billFilter),
      Party.countDocuments(partyFilter),
    ]);

  const counts = {
    invoices: invCount,
    quotes: quoCount,
    expenses: expCount,
    purchases: purCount,
    parties: partiesCount,
  };
  return counts;
}

function buildFilter(startDate, endDate, orgId) {
  const normalizedStartDate = buildDateBoundary(startDate);
  const normalizedEndDate = buildDateBoundary(endDate, true);
  const dateFilter =
    normalizedStartDate && normalizedEndDate
      ? {
          $gte: normalizedStartDate,
          $lte: normalizedEndDate,
        }
      : undefined;

  const billFilter = {
    org: orgId,
    ...(dateFilter ? { date: dateFilter } : {}),
  };
  const partyFilter = {
    org: orgId,
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };
  return { billFilter, partyFilter };
}

const getDashboardData = async ({ startDate, endDate, orgId }) => {
  const { billFilter, partyFilter } = buildFilter(startDate, endDate, orgId);

  const counts = await getCountsByFilter(billFilter, partyFilter);
  const recentEntities = [Invoice, Quotes, Purchase];
  const [invoices, quotes, purchases] = await getLastBills(
    recentEntities,
    billFilter,
  );
  return {
    counts,
    tables: {
      invoices,
      quotes,
      purchases,
    },
  };
};

module.exports = {
  getDashboardData,
};
