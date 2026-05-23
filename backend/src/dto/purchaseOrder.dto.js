const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const purchaseOrderDto = z.object({
  ...baseDocumentFields,
  org: z.string().describe("Organization"),
  sequence: z.coerce.number().describe("Sequence"),
  discount: z.coerce.number().min(0).max(100).default(0).optional().describe("Discount"),
  prefix: z.string().optional().describe("Prefix"),
  num: z.string().optional().describe("Number"),
  status: z.enum(["draft", "sent", "paid"]).default("draft").optional().describe("Status"),
});

module.exports = { purchaseOrderDto };
