const dashboardService = require("../../services/dashboard.service");

const dashboardHandler = {
  get_business_stats: async (params) => {
    try {
      const { period = "thisMonth", org } = params;
      const stats = await dashboardService.getOrgStatsData({ period, orgId: org });
      return stats;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = dashboardHandler;
