const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const dashboardService = require("../../services/dashboard.service");

const getOrgStats = async (req, res) => {
  const { period } = req.query;
  const orgId = req.params.orgId;

  if (!isValidObjectId(orgId)) throw new OrgNotFound();

  const response = await dashboardService.getOrgStatsData({ period, orgId });

  return res.status(200).json({ data: response });
};

module.exports = getOrgStats;