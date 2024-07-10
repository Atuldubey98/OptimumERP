const { productDto } = require("../../dto/product.dto");
const { OrgNotFound } = require("../../errors/org.error");
const { ProductNotFound } = require("../../errors/product.error");
const Product = require("../../models/product.model");

const update = async (req, res) => {
  const productId = req.params.productId;
  const orgId = req.params.orgId;
  if (!productId) throw new ProductNotFound();
  if (!orgId) throw new OrgNotFound();
  const body = await productDto.validateAsync(req.body);
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, org: orgId },
    body,
    {
      new: true,
    }
  ).lean();
  if (!updatedProduct) throw new ProductNotFound();
  return res
    .status(200)
    .json({ data: updatedProduct, message: "Product updated successfully!" });
};

module.exports = update;
