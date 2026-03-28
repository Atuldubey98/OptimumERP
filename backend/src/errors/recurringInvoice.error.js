class RecurringInvoiceNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "RecurringInvoiceNotFound";
  }
}
class InvalidRecurrenceValue extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "InvalidRecurrenceValue";
  }
}
module.exports = { RecurringInvoiceNotFound, InvalidRecurrenceValue };
