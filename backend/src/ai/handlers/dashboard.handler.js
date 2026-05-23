const dashboardService = require("../../services/dashboard.service");
const { getDisplaySettingForOrg } = require("../../services/setting.service");
const { moneyUtils } = require("../../utils");

const dashboardHandler = {
  get_business_stats: async (params) => {
    try {
      const { period = "thisMonth", org } = params;
      const stats = await dashboardService.getOrgStatsData({ period, orgId: org });

      const displaySetting = await getDisplaySettingForOrg(org);
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const fromSmallest = (val) => moneyUtils.fromSmallestUnit(val || 0, decimalDigits);

      const convertTotal = (totalObj) => {
        if (!totalObj) {
          return {
            totalTax: 0,
            total: 0,
            shippingCharges: 0,
            grandTotal: 0,
            count: 0,
          };
        }
        return {
          totalTax: fromSmallest(totalObj.totalTax),
          total: fromSmallest(totalObj.total),
          shippingCharges: fromSmallest(totalObj.shippingCharges),
          grandTotal: fromSmallest(totalObj.grandTotal),
          count: totalObj.count || 0,
        };
      };

      const topFiveClientTotal = (stats.topFiveClientTotal || []).map((client) => ({
        ...client,
        totalTax: fromSmallest(client.totalTax),
        total: fromSmallest(client.total),
        shippingCharges: fromSmallest(client.shippingCharges),
        grandTotal: fromSmallest(client.grandTotal),
        count: client.count || 0,
      }));

      const expensesByCategory = (stats.expensesByCategory || []).map((exp) => ({
        ...exp,
        total: fromSmallest(exp.total),
        count: exp.count || 0,
      }));

      return {
        invoicesTotal: convertTotal(stats.invoicesTotal),
        purchaseTotal: convertTotal(stats.purchaseTotal),
        topFiveClientTotal,
        expensesByCategory,
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = dashboardHandler;
