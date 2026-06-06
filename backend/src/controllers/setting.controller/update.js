const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const Setting = require("../../models/settings.model");
const { invalidateSettingCache, sanitizeSetting } = require("../../services/setting.service");

const update = async (req, res) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const updatedSetting = await Setting.findOneAndUpdate(
    { org: orgId },
    req.body,
    { new: true , runValidators: true}
  ).populate("org");
  invalidateSettingCache(orgId);
  const plainSetting = updatedSetting ? updatedSetting.toObject() : null;
  const sanitizedSetting = sanitizeSetting(plainSetting);
  return res.status(200).json({ data: sanitizedSetting });
};

module.exports = update;
