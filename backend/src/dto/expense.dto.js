const { z } = require("zod");

const expenseDto = z.object({
  description: z.string().describe("Description"),
  amount: z.number().int().describe("Amount"),
  category: z.string().nullable().optional().describe("Category"),
  date: z.string().optional().describe("Date"),
  createdBy: z.string().optional().describe("Created By"),
  updatedBy: z.string().optional().describe("Updated By"),
  org: z.string().optional().describe("Organization"),
});

module.exports = { expenseDto };
