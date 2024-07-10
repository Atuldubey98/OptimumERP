const {
  paginate: getInvoices,
} = require("../../controllers/invoice.controller");
const {
  paginate: getPurchases,
} = require("../../controllers/purchase.controller");
const { paginate } = require("../transaction.controller");

const getReportByType = async (req, res) => {
  const reportType = req.params.reportType;
  const reportMap = {
    sale: getInvoices,
    purchase: getPurchases,
    transactions: paginate,
    gstr1: getInvoices,
    gstr2: getPurchases,
  };
  const reportHandler = reportMap[reportType];
  if (!reportHandler) throw new Error("Report type not found");
  reportHandler(req, res);
};

module.exports = getReportByType;
