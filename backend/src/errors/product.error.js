class ProductNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "ProductNotFound";
  }
}

module.exports = { ProductNotFound };
