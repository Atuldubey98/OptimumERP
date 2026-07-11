const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const dashboardService = require("../../services/dashboard.service");

const forecast = async (req, res) => {
  const orgId = req.params.orgId;
  const forecastMonths = parseInt(req.query.forecastMonths) || 3;

  if (!isValidObjectId(orgId)) throw new OrgNotFound();

  const forecastData = await dashboardService.getSalesForecast(orgId, forecastMonths);
  return res.status(200).json({
    data: forecastData,
  });
};

module.exports = forecast;
