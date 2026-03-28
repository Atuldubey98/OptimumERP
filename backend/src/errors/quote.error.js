class QuoteNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "QuoteNotFound";
  }
}
class QuotationDuplicate extends Error {
  constructor(quotationId) {
    super();
    this.code = 400;
    this.name = "QuotationDuplicate";
    this.params = { id: quotationId };
  }
}
module.exports = { QuoteNotFound, QuotationDuplicate };
