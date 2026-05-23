const { z } = require("zod");

const productDto = z.object({
  name: z.string().describe("Name"),
  costPrice: z.number().int().optional().describe("Cost Price"),
  sellingPrice: z.number().int().optional().describe("Selling Price"),
  description: z.string().max(200).optional().describe("Description"),
  um: z.string().optional().describe("Unit of Measurement"),
  type: z.enum(["goods", "service"]).describe("Type"),
  code: z.string().optional().describe("Code"),
  category: z.string().nullable().optional().describe("Category"),
  createdBy: z.string().optional().describe("Created By"),
  updatedBy: z.string().optional().describe("Updated By"),
});

module.exports = { productDto };
