const OrgModel = require("../../models/org.model");

const uploadLogo = async (req, res) => {
  const path = req.file.path;
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { logo: path },
    { lean: true }
  );
  return res.status(200).json({ status: true, data: req.file });
};

module.exports = uploadLogo;
