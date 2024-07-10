class RecurringInvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Recurring Invoice does not exists";
    this.name = "RecurringInvoiceNotFound";
  }
}
class InvalidRecurrenceValue extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Recurring Invoice is invalid";
    this.name = "InvalidRecurrenceValue";
  }
}
module.exports = { RecurringInvoiceNotFound, InvalidRecurrenceValue };
