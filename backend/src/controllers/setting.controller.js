const { isValidObjectId } = require("mongoose");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Setting = require("../models/settings.model");
const { OrgNotFound } = require("../errors/org.error");

exports.getSetting = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const setting = await Setting.findOne({ org: orgId }).populate("org");
  if (!setting) throw new Error("Setting not found!");
  return res.status(200).json({ data: setting });
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
