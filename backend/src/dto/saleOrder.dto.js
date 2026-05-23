const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const saleOrderDto = z.object({
  ...baseDocumentFields,
  createdBy: z.string().describe("Created By"),
  soNo: z.coerce.number().optional().describe("SO Number"),
  status: z.enum(["draft", "sent", "pending"]).default("draft").optional().describe("Status"),
});

module.exports = { saleOrderDto };
