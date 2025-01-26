const cloudinary = require("../../cloudinary");
const OrgModel = require("../../models/org.model")
const removeLogo = async (req, res) => {
  const response = await cloudinary.uploader.destroy(`OptimumERP/${req.params.orgId}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { logo: null },
    { lean: true }
  );
  return res
    .status(200)
    .json({ status: response.result === "ok", message: "Logo removed" });
};

module.exports = removeLogo;
