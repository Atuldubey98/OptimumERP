const Tax = require("../../models/tax.model");
const toggleEnable = async (req, res) => {
  const tax = await Tax.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  }).select("enabled");
  tax.enabled = !tax.enabled;
  await tax.save();
  return res
    .status(200)
    .json({ message: tax.enabled ? "Enabled tax" : "Disabled tax" });
};

module.exports = toggleEnable;
