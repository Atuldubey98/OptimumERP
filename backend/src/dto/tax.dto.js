const { z } = require("zod");

const taxDto = z.object({
  name: z.string().max(8).describe("Name"),
  description: z.string().max(80).optional().describe("Description"),
  type: z.enum(["single", "grouped"]).default("single").describe("Type"),
  category: z.enum(["igst", "sgst", "cgst", "vat", "cess", "sal", "others", "none"]).describe("Category"),
  children: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional().describe("Children"),
  percentage: z.number().min(0).max(100).default(0).optional().describe("Percentage"),
  enabled: z.boolean().default(true).optional().describe("Enabled"),
  createdBy: z.string().describe("Created By"),
});

module.exports = { taxDto };
