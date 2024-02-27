class QuoteNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Quote does not exists";
    this.name = "QuoteNotFound";
  }
}
class QuotationDuplicate extends Error {
  constructor(quotationId) {
    super();
    this.code = 400;
    this.message = `Quotation already exists with quotation id : ${quotationId}`;
    this.name = "QuotationDuplicate";
  }
}
module.exports = { QuoteNotFound, QuotationDuplicate };
