const Tax = require("../../models/tax.model");
const { invalidateTaxCache } = require("../../services/tax.service");
const toggleEnable = async (req, res) => {
  const tax = await Tax.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  }).select("enabled");
  tax.enabled = !tax.enabled;
  await tax.save();
  invalidateTaxCache(req.params.orgId);
  return res
    .status(200)
    .json({
      message: tax.enabled
        ? req.t("common:api.tax_enabled")
        : req.t("common:api.tax_disabled"),
    });
};

module.exports = toggleEnable;
