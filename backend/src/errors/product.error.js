class ProductNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Product Not found";
    this.name = "ProductNotFound";
  }
}

module.exports = { ProductNotFound };
