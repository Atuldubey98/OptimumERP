const { PartyNotFound } = require("../../errors/party.error");
const partyService = require("../../services/party.service");
const settingService = require("../../services/setting.service")

const getDateFilterFromDuration = (duration) => {
  const now = new Date();
  let startDate = new Date();

  switch (duration) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "60d":
      startDate.setDate(now.getDate() - 60);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1w":
      startDate.setDate(now.getDate() - 7);
      break;
    case "2w":
      startDate.setDate(now.getDate() - 14);
      break;
    case "1m":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(now.getMonth() - 3);
      break;
    default:
      return null;
  }

  return {
    $gte: startDate,
    $lte: now
  };
};
const partyHandler = {
  create_party: (params) => {
    return partyService.create(params);
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

      return {
        success: true,
        filter: params?.duration ? `last ${params.duration}` : "financial_year",
        ...ledgerDetails
      };

    } catch (error) {
      throw error;
    }
  }
}
module.exports = partyHandler;