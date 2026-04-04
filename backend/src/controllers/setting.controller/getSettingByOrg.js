const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const OrgUser = require("../../models/orgUser.model");
const propertyService = require("../../services/property.service");
const { getDetailedSettingForOrg } = require("../../services/setting.service");
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

  return res.status(200).json({ data: { setting, role, currency } });
};

module.exports = getSettingByOrg;
