class TaxNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "TaxNotFound";
  }
}

module.exports = { TaxNotFound };
