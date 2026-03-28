class ExpenseNotFound extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "ExpenseNotFound";
  }
}

module.exports = { ExpenseNotFound };
  