const dashboardService = require("../../services/dashboard.service");

const forecastSalesHandler = async ({ forecastMonths = 3, org }) => {
  return await dashboardService.getSalesForecast(org, forecastMonths);
};

module.exports = { forecast_sales: forecastSalesHandler };
