class SaleOrderNotFound extends Error {
    constructor() {
      super();
      this.code = 404;
      this.message = "Sale Order does not exists";
      this.name = "SaleOrderNotFound";
    }
  }
  class SaleOrderNotDeleted extends Error {
    constructor({ reason = "Invoice not deleted" }) {
      super();
      this.code = 400;
      this.message = reason;
      this.name = "SaleOrderNotDeleted";
    }
  }
  
  class SaleOrderDuplicate extends Error {
    constructor(saleOrderId) {
      super();
      this.code = 400;
      this.message = `Invoice already exists with invoice id : ${saleOrderId}`;
      this.name = "SaleOrderDuplicate";
    }
  }
  module.exports = { SaleOrderNotFound, SaleOrderDuplicate, SaleOrderNotDeleted };
  