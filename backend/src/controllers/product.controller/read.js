const { OrgNotFound } = require("../../errors/org.error");
const { ProductNotFound } = require("../../errors/product.error");
const Product = require("../../models/product.model");

const read = async (req, res) => {
  const productId = req.params.productId;
  if (!productId) throw new ProductNotFound();
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const product = await Product.findOne({
    org: orgId,
    _id: productId,
  });
  if (!product) throw new ProductNotFound();
  return res
    .status(200)
    .json({ data: product, message: "Product retrieved successfully!" });
};

module.exports = read;
