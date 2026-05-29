const Setting = require("../../models/settings.model");
const { invalidateSettingCache } = require("../../services/setting.service");
const { makeFilePathFromService } = require("../../storages");

const uploadSignature = async (req, res) => {
  const path = makeFilePathFromService(req.file.filename, "signatures");
  await Setting.updateOne(
    { org: req.params.orgId },
    { signature: path },
    { lean: true }
  );
  invalidateSettingCache(req.params.orgId);
  return res.status(200).json({ status: true, data: req.file });
};

module.exports = uploadSignature;
