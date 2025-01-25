const cloudinary = require("../../cloudinary");
const removeLogo = async (req, res) => {
  const response = await cloudinary.uploader.destroy(`OptimumERP/${req.params.orgId}`);
  await OrgModel.updateOne(
    { _id: req.parms.orgId },
    { logo: null },
    { lean: true }
  );
  return res
    .status(200)
    .json({ status: response.result === "ok", message: "Logo removed" });
};

module.exports = removeLogo;
