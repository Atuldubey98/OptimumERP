const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const purchaseDto = z.object({
  ...baseDocumentFields,
  num: z.string().describe("Number"),
  status: z.enum(["unpaid", "paid"]).default("unpaid").optional().describe("Status"),
});

module.exports = { purchaseDto };
