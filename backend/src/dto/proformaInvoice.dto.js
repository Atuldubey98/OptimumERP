const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const proformaInvoiceDto = z.object({
  ...baseDocumentFields,
  prefix: z.string().describe("Prefix"),
  sequence: z.number().describe("Sequence"),
  status: z.enum(["draft", "sent", "pending"]).default("draft").optional().describe("Status"),
});

module.exports = proformaInvoiceDto;
