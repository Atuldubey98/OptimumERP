const recurringInvoicesPeriods = [
  {
    value: "weekly",
    validRecurrenceNumbers: [4, 8, 12, 16, 20, 24, 28],
  },
  {
    value: "monthly",
    validRecurrenceNumbers: [2, 4, 6, 8, 10, 12],
  },
  {
    value: "quarterly",
    validRecurrenceNumbers: [2, 3, 4],
  },
  {
    value: "biannually",
    validRecurrenceNumbers: [2],
  },
];

module.exports = recurringInvoicesPeriods;
