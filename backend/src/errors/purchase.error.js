class PurchaseNotFound extends Error {
    constructor() {
      super();
      this.code = 404;
      this.message = "Purchase does not exists";
      this.name = "PurchaseNotFound";
    }
  }
  class PurchaseDuplicate extends Error {
    constructor(purchaseId) {
      super();
      this.code = 400;
      this.message = `Purchase already exists with purchase no : ${purchaseId} and customer`;
      this.name = "PurchaseDuplicate";
    }
  }
  module.exports = { PurchaseNotFound, PurchaseDuplicate };
  