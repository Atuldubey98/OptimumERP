const ProductCategory = require("../../models/productCategory.model");

const read = async (req, res) => {
  const productCategory = await ProductCategory.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  }).select(req.params.select);
  if (!productCategory)
    return res.status(404).json({ message: "Product category not found" });
  return res.status(200).json({ data: productCategory });
};

module.exports = read;
