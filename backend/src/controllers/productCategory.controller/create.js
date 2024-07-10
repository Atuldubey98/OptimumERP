const OrgModel = require("../../models/org.model");
const ProductCategory = require("../../models/productCategory.model");

const create = async (req, res) => {
  const { name, description } = req.body;
  const newProductCategory = new ProductCategory({
    name,
    description,
    org: req.params.orgId,
  });
  await newProductCategory.save();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.productCategories": 1 } }
  );
  return res.status(201).json({ data: newProductCategory });
};

module.exports = create;
