const Party = require("../../models/party.model");
const partyService = require("../../services/party.service");
const settingService = require("../../services/setting.service")
const { moneyUtils } = require("../../utils");

const { createPartyDto } = require("../../dto/party.dto");

const partyHandler = {
  create_party: async ({ org, createdBy, user, ...params }) => {
    const body = await createPartyDto.validateAsync({ ...params, org, createdBy });
    return partyService.create(body);
  },
  get_party: async (params) => {
    try {
      const party = await partyService.findOne({ ...params, select: "name billingAddress shippingAddress createdAt gstNo panNo" });
      return party;
    } catch (error) {
      return {
        error: true,
        message: "Error fetching party details. Please ensure the party name or ID is correct and try again."
      }
    }
  },
  get_party_ledger: async (params) => {
    try {
      const parseDuration = (duration) => {
        if (!duration) return null;

        const now = new Date();

        const map = {
          "7d": 7,
          "30d": 30,
          "60d": 60,
          "90d": 90,
          "1w": 7,
          "1m": 30
        };

        const days = map[duration];
        if (!days) return null;

        const start = new Date();
        start.setDate(now.getDate() - days);
        start.setHours(0, 0, 0, 0);

        return {
          $gte: start,
          $lte: now
        };
      };

      const getFinancialYearFilter = (financialYear) => {
        if (!financialYear?.start || !financialYear?.end) return null;

        const start = new Date(financialYear.start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(financialYear.end);
        end.setHours(23, 59, 59, 999);

        return {
          $gte: start,
          $lte: end
        };
      };

      const setting = await settingService.getDisplaySettingForOrg(params.org);

      let dateFilter = null;

      if (params?.duration) {
        dateFilter = parseDuration(params.duration);
      }

      if (!dateFilter) {
        dateFilter = getFinancialYearFilter(setting?.financialYear);
      }

      const ledgerDetails = await partyService.getLedgerTotals(
        params.partyId,
        params.org,
        dateFilter
      );

      const currencyConfig = await moneyUtils.getCurrencyConfigByCode(setting?.currency || "INR");
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const fromSmallest = (val) => moneyUtils.fromSmallestUnit(val, decimalDigits);

      const formattedLedger = {
        invoiceBalance: {
          total: fromSmallest(ledgerDetails.invoiceBalance.total),
          payment: fromSmallest(ledgerDetails.invoiceBalance.payment),
          due: fromSmallest(ledgerDetails.invoiceBalance.total - ledgerDetails.invoiceBalance.payment)
        },
        purchaseBalance: {
          total: fromSmallest(ledgerDetails.purchaseBalance.total),
          payment: fromSmallest(ledgerDetails.purchaseBalance.payment),
          due: fromSmallest(ledgerDetails.purchaseBalance.total - ledgerDetails.purchaseBalance.payment)
        }
      };

      return {
        success: true,
        filter: params?.duration ? `last ${params.duration}` : "financial_year",
        ...formattedLedger
      };

    } catch (error) {
      throw error;
    }
  },
  get_parties: async (params) => {
    const {
      query = "",
      page = 1,
      limit = 10
    } = params;

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = { org: params.org };

    if (query && query.trim()) {
      filter.$text = { $search: query.trim() };
    }
    const [parties, total] = await Promise.all([
      Party.find(filter, { score: { $meta: "textScore" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit).lean(),
      Party.countDocuments(filter)
    ]);

    return {
      data: parties,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }
}
module.exports = partyHandler;