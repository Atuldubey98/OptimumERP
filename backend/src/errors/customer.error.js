class CustomerNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Customer does not exists";
    this.name = "CustomerNotFound";
  }
}

module.exports = { CustomerNotFound };
