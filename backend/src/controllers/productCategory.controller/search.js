const ProductCategory = require("../../models/productCategory.model");

const search = async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.keyword || "";
  if (search) filter.$text = { $search: search };
  const productCategories = await ProductCategory.find(filter).sort({
    createdAt: -1,
  });
  return res.status(200).json({ data: productCategories });
};

module.exports = search;
