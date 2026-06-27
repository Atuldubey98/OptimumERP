const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const reportService = require("../../services/report.service");

const profitAndLoss = async (req, res) => {
  const { startDate, endDate } = req.query;
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();

  const data = await reportService.getProfitAndLoss({
    orgId,
    startDate,
    endDate,
  });

  return res.status(200).json({
    data,
  });
};

module.exports = profitAndLoss;
