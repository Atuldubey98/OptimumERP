const OrgModel = require("../../models/org.model");
const { makeFilePathFromService } = require("../../storages");

const uploadLogo = async (req, res) => {
  const path = makeFilePathFromService(req.file.filename, "logos");
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { logo: path },
    { lean: true }
  );
  return res.status(200).json({ status: true, data: req.file });
};

module.exports = uploadLogo;
