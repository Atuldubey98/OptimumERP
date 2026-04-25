const { getPaginationParams } = require("../../services/crud.service");
const PaymentVoucher = require("../../models/paymentVoucher.model");
const entities = require("../../constants/entities");
require("../../models/invoice.model");
require("../../models/purchase.model");

const getAll = async (req, res) => {
  const { filter, skip, limit, total, totalPages, page } =
    await getPaginationParams({
      query: req.query,
      params: req.params,
      model: PaymentVoucher,
      modelName: entities.PAYMENT_VOUCHERS,
    });
  const vouchers = await PaymentVoucher.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("party", "name")
    .populate("refDoc", "num")
    .lean();

  return res.status(200).json({ 
    data: vouchers, 
    total, 
    page, 
    limit, 
    totalPages 
  });
};

module.exports = getAll;
