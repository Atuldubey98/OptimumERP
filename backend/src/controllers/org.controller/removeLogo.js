const OrgModel = require("../../models/org.model");
const removeLogo = async (req, res) => {
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { logo: null },
    { lean: true }
  );
  return res
    .status(200)
    .json({ status: true, message: "Logo removed" });
};

module.exports = removeLogo;
