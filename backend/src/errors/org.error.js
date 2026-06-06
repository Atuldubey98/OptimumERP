class OrgNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "OrgNotFound";
  }
}

class InvalidFinancialYearStart extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "InvalidFinancialYearStart";
  }
}

class InvalidFinancialYearEnd extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "InvalidFinancialYearEnd";
  }
}

module.exports = {
  OrgNotFound,
  InvalidFinancialYearStart,
  InvalidFinancialYearEnd,
};
