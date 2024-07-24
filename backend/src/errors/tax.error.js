class TaxNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Tax not found";
    this.name = "TaxNotFound";
  }
}

module.exports = { TaxNotFound };
