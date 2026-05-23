const { z } = require("zod");

const umDto = z.object({
  name: z.string().max(20).describe("Name"),
  description: z.string().max(80).optional().describe("Description"),
  unit: z.string().max(10).describe("Unit"),
  enabled: z.boolean().default(true).optional().describe("Enabled"),
  createdBy: z.string().length(24).describe("Created By"),
  updatedBy: z.string().length(24).optional().describe("Updated By"),
});

module.exports = { umDto };
