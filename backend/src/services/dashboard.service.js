const { Types, isValidObjectId } = require("mongoose");
const logger = require("../logger");
const Invoice = require("../models/invoice.model");
const Quotes = require("../models/quotes.model");
const Party = require("../models/party.model");
const Expense = require("../models/expense.model");
const Purchase = require("../models/purchase.model");
const { dateUtils, doubleExponentialSmoothing } = require("../utils");
const cacheService = require("./cache.service");
const settingService = require("./setting.service");

const getPeriodFilters = (period, timeZone = "UTC") => {
  const localizedNow = dateUtils.getLocalizedNow(timeZone);

  const startOfWeek = new Date(localizedNow);
  startOfWeek.setDate(localizedNow.getDate() - localizedNow.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(
    localizedNow.getFullYear(),
    localizedNow.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
  const endOfMonth = new Date(
    localizedNow.getFullYear(),
    localizedNow.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const startOfYear = new Date(localizedNow.getFullYear(), 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(
    localizedNow.getFullYear(),
    11,
    31,
    23,
    59,
    59,
    999
  );

  const filters = {
    thisWeek: {
      $gte: dateUtils.toUTC(startOfWeek, timeZone),
      $lte: dateUtils.toUTC(endOfWeek, timeZone),
    },
    thisMonth: {
      $gte: dateUtils.toUTC(startOfMonth, timeZone),
      $lte: dateUtils.toUTC(endOfMonth, timeZone),
    },
    thisYear: {
      $gte: dateUtils.toUTC(startOfYear, timeZone),
      $lte: dateUtils.toUTC(endOfYear, timeZone),
    },
  };

  return filters[period] || filters.thisMonth;
};

const buildDateBoundary = (dateString, isEndOfDay = false, timeZone = "UTC") => {
  if (!dateString || typeof dateString !== "string") return null;

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = isEndOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);

  return dateUtils.toUTC(date, timeZone);
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
        .exec()
    )
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

async function buildFilter({ startDate, endDate, period, orgId }) {
  let dateFilter;
  const setting = await settingService.getDisplaySettingForOrg(orgId);
  const timeZone = setting.timeZone || "UTC";

  if (period) {
    dateFilter = getPeriodFilters(period, timeZone);
  } else if (startDate && endDate) {
    const normalizedStartDate = buildDateBoundary(startDate, false, timeZone);
    const normalizedEndDate = buildDateBoundary(endDate, true, timeZone);
    if (normalizedStartDate && normalizedEndDate) {
      dateFilter = {
        $gte: normalizedStartDate,
        $lte: normalizedEndDate,
      };
    }
  }

  const billFilter = {
    org: orgId,
    ...(dateFilter ? { date: dateFilter } : {}),
  };
  const partyFilter = {
    org: orgId,
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };
  return { billFilter, partyFilter, dateFilter };
}

const getDashboardData = async ({ startDate, endDate, period, orgId }) => {
  const { billFilter, partyFilter } = await buildFilter({
    startDate,
    endDate,
    period,
    orgId,
  });

  const counts = await getCountsByFilter(billFilter, partyFilter);
  const recentEntities = [Invoice, Quotes, Purchase];
  const [invoices, quotes, purchases] = await getLastBills(
    recentEntities,
    billFilter
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

const getOrgStatsData = async ({ period, orgId }) => {
  const cacheKey = cacheService.buildKey("org-stats", orgId, period);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const { dateFilter } = await buildFilter({ period, orgId });
      const objectOrgId = new Types.ObjectId(orgId);

      const baseMatch = {
        org: objectOrgId,
        date: dateFilter,
      };

      const aggregator = [
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            totalTax: { $sum: "$totalTax" },
            total: { $sum: "$total" },
            shippingCharges: { $sum: "$shippingCharges" },
            grandTotal: { $sum: "$grandTotal" },
            count: { $sum: 1 },
          },
        },
      ];

      const topFiveAggregator = [
        { $match: baseMatch },
        {
          $group: {
            _id: "$party",
            totalTax: { $sum: "$totalTax" },
            total: { $sum: "$total" },
            shippingCharges: { $sum: "$shippingCharges" },
            grandTotal: { $sum: "$grandTotal" },
            count: { $sum: 1 },
          },
        },
        { $sort: { grandTotal: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "parties",
            localField: "_id",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  gstNo: 1,
                },
              },
            ],
            as: "party",
          },
        },
        { $unwind: "$party" },
      ];

      const expensesPipeline = [
        { $match: baseMatch },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "expense_categories",
            localField: "_id",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                },
              },
            ],
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      const [
        invoicesTotal,
        purchaseTotal,
        topFiveClientTotal,
        expensesByCategory,
      ] = await Promise.all([
        Invoice.aggregate(aggregator),
        Purchase.aggregate(aggregator),
        Invoice.aggregate(topFiveAggregator),
        Expense.aggregate(expensesPipeline),
      ]);

      return {
        invoicesTotal: invoicesTotal.length ? invoicesTotal[0] : null,
        purchaseTotal: purchaseTotal.length ? purchaseTotal[0] : null,
        topFiveClientTotal,
        expensesByCategory,
      };
    },
    {
      ttl: cacheService.TTL.medium,
      onHit: (key) => logger.debug(`Cache hit for ${key}`),
      onMiss: (key) => logger.debug(`Cache miss for ${key}`),
    }
  );
};

async function getSalesForecast(orgId, forecastMonths = 3) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);

  const historyRaw = await Invoice.aggregate([
    {
      $match: {
        org: new Types.ObjectId(orgId),
        status: { $in: ["draft", "sent", "pending"] },
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" }
        },
        totalSales: { $sum: "$total" },
        invoiceCount: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const history = historyRaw.map(item => ({
    period: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    sales: item.totalSales,
    invoices: item.invoiceCount
  }));

  const salesValues = history.map(h => h.sales);
  const forecastedValues = doubleExponentialSmoothing(salesValues, forecastMonths);

  const forecast = [];
  let lastYear, lastMonth;
  if (history.length > 0) {
    const [y, m] = history[history.length - 1].period.split("-").map(Number);
    lastYear = y;
    lastMonth = m;
  } else {
    const now = new Date();
    lastYear = now.getFullYear();
    lastMonth = now.getMonth() + 1;
  }

  for (let i = 0; i < forecastMonths; i++) {
    lastMonth++;
    if (lastMonth > 12) {
      lastMonth = 1;
      lastYear++;
    }
    const periodStr = `${lastYear}-${String(lastMonth).padStart(2, "0")}`;
    forecast.push({
      period: periodStr,
      salesForecast: Math.round(forecastedValues[i] * 100) / 100
    });
  }

  return {
    history,
    forecast,
    summary: {
      averageHistoricalSales: salesValues.length > 0 ? (salesValues.reduce((a, b) => a + b, 0) / salesValues.length) : 0,
      predictedGrowth: salesValues.length > 0 ? (forecastedValues[forecastMonths - 1] - salesValues[salesValues.length - 1]) : 0
    }
  };
}

module.exports = {
  getDashboardData,
  getOrgStatsData,
  getSalesForecast,
};
