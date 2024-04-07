class InvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Invoice does not exists";
    this.name = "InvoiceNotFound";
  }
}
class InvoiceNotDelete extends Error {
  constructor({ reason = "Invoice not deleted" }) {
    super();
    this.code = 400;
    this.message = reason;
    this.name = "InvoiceNotDelete";
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
module.exports = { InvoiceNotFound, InvoiceDuplicate, InvoiceNotDelete };
