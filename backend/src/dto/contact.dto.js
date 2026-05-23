const { z } = require("zod");

const contactDto = z.object({
  name: z.string().min(2).max(40).describe("Name"),
  email: z.string().email().max(40).describe("Email"),
  party: z.string().nullable().default(null).optional().describe("Party"),
  telephone: z.string().optional().describe("Telephone"),
  description: z.string().max(80).optional().describe("Description"),
  type: z.string().describe("Type"),
  createdBy: z.string().describe("Created By"),
  updatedBy: z.string().optional().describe("Updated By"),
});

module.exports = { contactDto };
