const { productDto } = require("../../dto/product.dto");
const { OrgNotFound } = require("../../errors/org.error");
const OrgModel = require("../../models/org.model");
const Product = require("../../models/product.model");

const create = async (req, res) => {
  const body = await productDto.validateAsync(req.body);
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const product = new Product({ org: orgId, ...body });
  const newProduct = await product.save();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.products": 1 } }
  );
  return res
    .status(201)
    .json({ data: newProduct, message: "New product created !" });
};

module.exports = create;
