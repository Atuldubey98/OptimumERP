class SaleOrderNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "SaleOrderNotFound";
  }
}
class SaleOrderNotDeleted extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "SaleOrderNotDeleted";
  }
}

class SaleOrderDuplicate extends Error {
  constructor(saleOrderId) {
    super();
    this.code = 400;
    this.name = "SaleOrderDuplicate";
    this.params = { id: saleOrderId };
  }
}
module.exports = { SaleOrderNotFound, SaleOrderDuplicate, SaleOrderNotDeleted };
  