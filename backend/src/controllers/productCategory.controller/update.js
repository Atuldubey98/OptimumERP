const ProductCategory = require("../../models/productCategory.model");

const update = async (req, res) => {
  const updatedProductCategory = await ProductCategory.findOneAndUpdate(
    {
      _id: req.params.id,
      org: req.params.orgId,
    },
    req.body,
    { new: true }
  );
  if (!updatedProductCategory) {
    return res
      .status(404)
      .json({ message: req.t("common:api.product_category_not_found") });
  }
  return res.status(200).json(updatedProductCategory);
};

module.exports = update;
