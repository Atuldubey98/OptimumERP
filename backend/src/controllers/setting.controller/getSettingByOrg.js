const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");
const Setting = require("../../models/settings.model");
const OrgUser = require("../../models/orgUser.model");

const getSettingByOrg = async (req, res) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const setting = await Setting.findOne({ org: orgId })
    .populate("org")
    .populate("receiptDefaults.tax")
    .populate("receiptDefaults.um");
  if (!setting) throw new Error("Setting not found!");
  const orgUser = await OrgUser.findOne({
    org: orgId,
    user: req.session.user._id,
  }).select("role");
  const role = orgUser.role;
  return res.status(200).json({ data: setting, role });
};

module.exports = getSettingByOrg;
