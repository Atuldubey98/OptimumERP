class ExpenseNotFound extends Error {
    constructor() {
      super();
      this.code = 400;
      this.message = "Expense not found";
      this.name = "ExpenseNotFound";
    }
  }
  
  module.exports = { ExpenseNotFound };
  