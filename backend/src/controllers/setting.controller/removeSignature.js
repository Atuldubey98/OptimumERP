const Setting = require("../../models/settings.model");
const { invalidateSettingCache } = require("../../services/setting.service");

const removeSignature = async (req, res) => {
  await Setting.updateOne(
    { org: req.params.orgId },
    { signature: null },
    { lean: true }
  );
  invalidateSettingCache(req.params.orgId);
  return res
    .status(200)
    .json({ status: true, message: req.t("common:api.signature_removed") });
};

module.exports = removeSignature;
