class InvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "InvoiceNotFound";
  }
}
class InvoiceNotDelete extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "InvoiceNotDelete";
  }
}

class InvoiceDuplicate extends Error {
  constructor(invoiceId) {
    super();
    this.code = 400;
    this.name = "InvoiceDuplicate";
    this.params = { id: invoiceId };
  }
}
module.exports = { InvoiceNotFound, InvoiceDuplicate, InvoiceNotDelete };
