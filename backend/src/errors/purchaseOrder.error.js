class PurchaseOrderNotFound extends Error {
    constructor() {
      super();
      this.code = 404;
      this.message = "Purchase order does not exists";
      this.name = "PurchaseOrderNotFound";
    }
  }
  class PurchaseOrderDuplicate extends Error {
    constructor(poNo) {
      super();
      this.code = 400;
      this.message = `Purchase order already exists with quotation id : ${poNo}`;
      this.name = "PurchaseOrderDuplicate";
    }
  }
  module.exports = { PurchaseOrderNotFound, PurchaseOrderDuplicate };
  