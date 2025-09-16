class PropertyNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "ProformaInvoice does not exists";
    this.name = "PropertyNotFound";
  }
}

module.exports = {PropertyNotFound};