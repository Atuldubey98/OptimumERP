const Joi = require("joi");
const { OrgNotFound } = require("../../errors/org.error");
const Product = require("../../models/product.model");
const OrgModel = require("../../models/org.model");
const { productDto } = require("../../dto/product.dto");

const bulkCreate = async (req, res) => {
  const body = await Joi.array()
    .items(productDto)
    .validateAsync(req.body.items);
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const productsToInsert = body.map((product) => ({
    ...product,
    org: orgId,
    createdBy: req.body.createdBy,
  }));
  const insertedProducts = await Product.insertMany(productsToInsert);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.products": insertedProducts.length } }
  );
  return res.status(201).json({ message: "Products created" });
};

module.exports = bulkCreate;
