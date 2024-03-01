const read = require("../read");

module.exports = ({ axios, cookie, orgId }) => {
  function createProduct(product) {
    return axios.post(`/api/v1/organizations/${orgId}/products`, product, {
      headers: {
        Cookie: cookie,
      },
    });
  }
  async function getProducts() {
    const data = await read(
      "/home/atul/Development/erp_mern/backend/src/mock-database/raw-data/products.csv"
    );
    const products = data.map((product) => ({
      ...product,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
    }));
    return products;
  }
  async function createManyProducts() {
    const products = await getProducts();
    await Promise.all(products.map((product) => createProduct(product)));
  }
  return {
    createProduct,
    getProducts,
    createManyProducts,
  };
};
