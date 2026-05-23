const { z } = require("zod");
const { baseDocumentFields } = require("./common.dto.js");

const quoteDto = z.object({
  ...baseDocumentFields,
  prefix: z.string().describe("Prefix"),
  sequence: z.coerce.number().describe("Sequence"),
  status: z.enum(["draft", "pending", "sent", "accepted", "declined"]).default("draft").optional().describe("Status"),
});

module.exports = { quoteDto };
