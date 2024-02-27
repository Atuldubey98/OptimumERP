class InvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Invoice does not exists";
    this.name = "InvoiceNotFound";
  }
}
class InvoiceDuplicate extends Error {
  constructor(invoiceId) {
    super();
    this.code = 400;
    this.message = `Invoice already exists with invoice id : ${invoiceId}`;
    this.name = "InvoiceDuplicate";
  }
}
module.exports = { InvoiceNotFound, InvoiceDuplicate };
