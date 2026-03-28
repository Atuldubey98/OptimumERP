class PurchaseOrderNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "PurchaseOrderNotFound";
  }
}
class PurchaseOrderDuplicate extends Error {
  constructor(poNo) {
    super();
    this.code = 400;
    this.name = "PurchaseOrderDuplicate";
    this.params = { id: poNo };
  }
}
module.exports = { PurchaseOrderNotFound, PurchaseOrderDuplicate };
  