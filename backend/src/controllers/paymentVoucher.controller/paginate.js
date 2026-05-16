const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");
const PaymentVoucher = require("../../models/paymentVoucher.model");
const entities = require("../../constants/entities");
const logger = require("../../logger");
require("../../models/invoice.model");
require("../../models/purchase.model");

const getAll = async (req, res) => {
  if (req.params.invoiceId) {
    req.query.refDoc = req.params.invoiceId;
    req.query.refDocModel = "invoice";
  } else if (req.params.purchaseId) {
    req.query.refDoc = req.params.purchaseId;
    req.query.refDocModel = "purchase";
  }

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
  logger.info("User limits", req.session.user.limits)
  return res.status(200).json({
    data: vouchers,
    total,
    page,
    limit,
    totalPages,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "paymentVouchers",
    }),
  });
};

module.exports = getAll;
