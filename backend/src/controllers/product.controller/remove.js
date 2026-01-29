const { OrgNotFound } = require("../../errors/org.error");
const { ProductNotFound } = require("../../errors/product.error");
const OrgModel = require("../../models/org.model");
const Product = require("../../models/product.model");

const remove = async (req, res) => {
  const productId = req.params.productId;
  const orgId = req.params.orgId;
  if (!productId) throw new ProductNotFound();
  if (!orgId) throw new OrgNotFound();
  const deletedProduct = await Product.softDelete({
    _id: productId,
    org: req.params.orgId,
  }).lean();

  if (!deletedProduct) throw new ProductNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.products": -1 } }
  );
  return res.status(200).json({ message: "Product deleted successfully!" });
};
module.exports = remove;
