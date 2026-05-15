export const recurringInvoiceStatusList = [
  {
    type: "active",
    label: "recurring_invoice_ui.status.active",
    colorScheme: "teal",
  },
  {
    type: "paused",
    label: "recurring_invoice_ui.status.paused",
    colorScheme: "yellow",
  },
  {
    type: "completed",
    label: "recurring_invoice_ui.status.completed",
    colorScheme: "blue",
  },
  {
    type: "cancelled",
    label: "recurring_invoice_ui.status.cancelled",
    colorScheme: "red",
  },
];

export const intervalOptions = [
  { value: "daily", label: "recurring_invoice_ui.interval.daily" },
  { value: "weekly", label: "recurring_invoice_ui.interval.weekly" },
  { value: "monthly", label: "recurring_invoice_ui.interval.monthly" },
  { value: "quarterly", label: "recurring_invoice_ui.interval.quarterly" },
  { value: "half_yearly", label: "recurring_invoice_ui.interval.half_yearly" },
  { value: "yearly", label: "recurring_invoice_ui.interval.yearly" },
];

export const dayOptions = [
  { value: "sunday", label: "recurring_invoice_ui.days.sunday" },
  { value: "monday", label: "recurring_invoice_ui.days.monday" },
  { value: "tuesday", label: "recurring_invoice_ui.days.tuesday" },
  { value: "wednesday", label: "recurring_invoice_ui.days.wednesday" },
  { value: "thursday", label: "recurring_invoice_ui.days.thursday" },
  { value: "friday", label: "recurring_invoice_ui.days.friday" },
  { value: "saturday", label: "recurring_invoice_ui.days.saturday" },
];

export const dateOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: (i + 1).toString(),
}));
