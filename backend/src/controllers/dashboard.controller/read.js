const { isValidObjectId } = require("mongoose");

const { OrgNotFound } = require("../../errors/org.error");

const dashboardService = require("../../services/dashboard.service");
const read = async (req, res) => {
  const { startDate, endDate } = req.query;
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const dashboardData = await dashboardService.getDashboardData({
    startDate,
    endDate,
    orgId,
  });
  return res.status(200).json({
    data: dashboardData,
  });
};

module.exports = read;
