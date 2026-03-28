class ExpenseCategoryNotDeleted extends Error {
  constructor({ reason }) {
    super();
    this.code = 400;
    this.name = "ExpenseCategoryNotDeleted";
    this.params = { reason };
  }
}

class ExpenseCategoryNotFound extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "ExpenseCategoryNotFound";
  }
}

module.exports = { ExpenseCategoryNotDeleted, ExpenseCategoryNotFound };
