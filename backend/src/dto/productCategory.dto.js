const { z } = require("zod");

const productCategoryDto = z.object({
  name: z.string().min(3).max(80).describe("Name"),
  description: z.string().min(3).max(150).describe("Description"),
  enabled: z.boolean().optional().describe("Enabled"),
});

module.exports = productCategoryDto;
