const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const baseRecurringInvoiceFields = {
  ...baseDocumentFields,
  status: z.enum(["paused", "active", "cancelled"]).default("active").optional().describe("Status"),
  generateInvoice: z.boolean().default(true).optional().describe("Generate Invoice"),
  generateProformaInvoice: z.boolean().default(false).optional().describe("Generate Proforma Invoice"),
};

const frequencyFields = {
  interval: z.enum(["weekly", "monthly", "yearly", "quarterly", "triannually", "semiannually", "half_yearly", "daily"]).describe("Interval"),
  startDate: z.union([z.string(), z.date()]).describe("Start Date"),
  endDate: z.union([z.string(), z.date()]).describe("End Date"),
  dateOfEveryMonth: z.coerce.number().min(1).max(31).optional().describe("Date Of Every Month"),
  dayOfEveryWeek: z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]).optional().describe("Day Of Every Week"),
};

const createRecurringInvoiceDto = z.object({
  ...baseRecurringInvoiceFields,
  ...frequencyFields,
  createdBy: z.string().optional().describe("Created By"),
});

const updateRecurringInvoiceDto = z.object({
  ...baseRecurringInvoiceFields,
  updatedBy: z.string().optional().describe("Updated By"),
});

module.exports = {
  createRecurringInvoiceDto,
  updateRecurringInvoiceDto,
};
