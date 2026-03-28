class ProformaInvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "ProformaInvoiceNotFound";
  }
}
class ProformaInvoiceNotDelete extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "ProformaInvoiceNotDelete";
  }
}

class ProformaInvoiceDuplicate extends Error {
  constructor(num) {
    super();
    this.code = 400;
    this.name = "ProformaInvoiceDuplicate";
    this.params = { id: num };
  }
}
module.exports = {
  ProformaInvoiceNotFound,
  ProformaInvoiceDuplicate,
  ProformaInvoiceNotDelete,
};
