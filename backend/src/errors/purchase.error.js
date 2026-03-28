class PurchaseNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "PurchaseNotFound";
  }
}
class PurchaseDuplicate extends Error {
  constructor(purchaseId) {
    super();
    this.code = 400;
    this.name = "PurchaseDuplicate";
    this.params = { id: purchaseId };
  }
}
module.exports = { PurchaseNotFound, PurchaseDuplicate };
  