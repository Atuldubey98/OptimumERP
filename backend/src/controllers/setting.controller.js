const { isValidObjectId } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Setting = require("../models/settings.model");
const { OrgNotFound } = require("../errors/org.error");
const OrgUser = require("../models/org_user.model");
exports.getSetting = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const setting = await Setting.findOne({ org: orgId }).populate("org");
  if (!setting) throw new Error("Setting not found!");
  const orgUser = await OrgUser.findOne({
    org: orgId,
    user: req.session.user._id,
  }).select("role");
  const role = orgUser.role;
  return res.status(200).json({ data: setting, role });
});

exports.updateSetting = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const updatedSetting = await Setting.findOneAndUpdate(
    { org: orgId },
    req.body,
    { new: true }
  ).populate("org");
  return res.status(200).json({ data: updatedSetting });
});
