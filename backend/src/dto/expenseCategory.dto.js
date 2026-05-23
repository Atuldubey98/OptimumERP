const { z } = require("zod");

const expenseCategoryDto = z.object({
  name: z.string().max(80).describe("Name"),
  description: z.string().max(150).optional().describe("Description"),
  enabled: z.boolean().optional().describe("Enabled"),
  createdBy: z.string().describe("Created By"),
  updatedBy: z.string().optional().describe("Updated By"),
  org: z.string().optional().describe("Organization"),
});

module.exports = { expenseCategoryDto };
