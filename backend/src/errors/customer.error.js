class CustomerNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Customer does not exists";
    this.name = "CustomerNotFound";
  }
}

class CustomerNotDelete extends Error {
  constructor({ reason = "Customer not deleted" }) {
    super();
    this.code = 400;
    this.message = reason;
    this.name = "CustomerNotDelete";
  }
}

module.exports = { CustomerNotFound, CustomerNotDelete };
