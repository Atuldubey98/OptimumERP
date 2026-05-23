const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const invoiceDto = z.object({
  ...baseDocumentFields,
  prefix: z.string().describe("Prefix"),
  sequence: z.number().describe("Sequence"),
  dueDate: z.string().optional().describe("Due Date"),
  status: z.enum(["draft", "sent", "pending"]).default("draft").optional().describe("Status"),
});

module.exports = { invoiceDto };
