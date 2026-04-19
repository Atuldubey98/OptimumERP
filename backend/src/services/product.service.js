const OrgModel = require("../models/org.model");
const Product = require("../models/product.model");
const { executeMongoDbTransaction } = require("./crud.service");

const getProductDetailsForAI = async (query, type, currentOrgId) => {
  try {
    const filter = {
      $text: { $search: query },
      org: currentOrgId,
    };

    if (type) {
      filter.type = type;
    }
    console.log(filter);

    const products = await Product.find(filter)
      .limit(5)
      .select("name price sellingPrice costPrice code type")
      .lean();

    if (!products || products.length === 0) {
      return `Database response: No products found matching the search term "${query}".`;
    }

    const formattedProducts = products
      .map((p) => {
        const codeStr = p.code ? ` (Code: ${p.code})` : "";
        return `- ${p.name}${codeStr} [Type: ${p.type}]: Selling Price is ${p.sellingPrice}, Cost Price is ${p.costPrice}`;
      })
      .join("\n");
    return `Database response: Found the following products:\n${formattedProducts}`;
  } catch (error) {
    throw error;
  }
};
const create = async (body) => {
  const product = await executeMongoDbTransaction(async (session) => {
    const product = new Product(body);
    const newProduct = await product.save({ session });
    await OrgModel.updateOne(
      { _id: body.org },
      { $inc: { "relatedDocsCount.products": 1 } },
      { session },
    );
    return product;
  });
  return product;
};
module.exports = {
  getProductDetailsForAI,
  create,
};
