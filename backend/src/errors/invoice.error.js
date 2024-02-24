class InvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Invoice does not exists";
    this.name = "InvoiceNotFound";
  }
}

module.exports = { InvoiceNotFound };
