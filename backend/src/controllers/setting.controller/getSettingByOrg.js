const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const OrgUser = require("../../models/orgUser.model");
const propertyService = require("../../services/property.service");
const { getDetailedSettingForOrg, sanitizeSetting } = require("../../services/setting.service");
const getSettingByOrg = async (req, res) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const [setting, orgUser, currencyConfig] = await Promise.all([
    getDetailedSettingForOrg(orgId),
    OrgUser.findOne({
      org: orgId,
      user: req.session.user._id,
    })
      .select("role")
      .lean()
      .exec(),
    propertyService.getCurrencyConfig(),
  ]);

  if (!setting) throw new Error(req.t("common:api.setting_not_found"));
  const role = orgUser?.role;
  const currency = currencyConfig.value[setting.currency];

  const sanitizedSetting = sanitizeSetting(setting);

  return res.status(200).json({ data: { setting: sanitizedSetting, role, currency } });
};

module.exports = getSettingByOrg;
