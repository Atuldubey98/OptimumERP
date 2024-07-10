class ExpenseCategoryNotDeleted extends Error {
  constructor({ reason = "Expense category not deleted" }) {
    super();
    this.code = 400;
    this.message = reason;
    this.name = "ExpenseCategoryNotDeleted";
  }
}

class ExpenseCategoryNotFound extends Error {
  constructor({ reason = "Expense category not found" }) {
    super();
    this.code = 400;
    this.message = reason;
    this.name = "ExpenseCategoryNotFound";
  }
}

module.exports = { ExpenseCategoryNotDeleted, ExpenseCategoryNotFound };
