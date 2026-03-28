const Product = require("../../models/product.model");
const ProductCategory = require("../../models/productCategory.model");
const OrgModel = require("../../models/org.model");
const remove = async (req, res) => {
  const product = await Product.findOne({ category: req.params.id });
  if (product)
    return res
      .status(400)
      .json({ message: req.t("common:api.product_category_used_by_product") });
  const deletedProductCategory = await ProductCategory.softDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });

  if (!deletedProductCategory)
    return res
      .status(404)
      .json({ message: req.t("common:api.product_category_not_found") });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.productCategories": -1 } }
  );
  return res
    .status(200)
    .json({ message: req.t("common:api.product_category_deleted") });
};

module.exports = remove;
