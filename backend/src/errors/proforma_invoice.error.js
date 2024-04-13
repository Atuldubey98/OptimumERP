class ProformaInvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "ProformaInvoice does not exists";
    this.name = "ProformaInvoiceNotFound";
  }
}
class ProformaInvoiceNotDelete extends Error {
  constructor({ reason = "ProformaInvoice not deleted" }) {
    super();
    this.code = 400;
    this.message = reason;
    this.name = "ProformaInvoiceNotDelete";
  }
}

class ProformaInvoiceDuplicate extends Error {
  constructor(proformaInvoiceId) {
    super();
    this.code = 400;
    this.message = `Invoice already exists with invoice id : ${proformaInvoiceId}`;
    this.name = "InvoiceDuplicate";
  }
}
module.exports = {
  ProformaInvoiceNotFound,
  ProformaInvoiceDuplicate,
  ProformaInvoiceNotDelete,
};
