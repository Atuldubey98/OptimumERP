const { z } = require("zod");

const createOrgDto = z.object({
  name: z.string().min(2).max(80).describe("Name"),
  alias: z.string().min(2).max(80).describe("Alias"),
  address: z.string().describe("Address"),
  gstNo: z.string().optional().describe("GST Number"),
  createdBy: z.string().describe("Created By"),
  financialYear: z.object({
    start: z.string().describe("Start Date"),
    end: z.string().describe("End Date"),
  }).describe("Financial Year"),
  panNo: z.string().optional().describe("PAN Number"),
  timezone: z.string().describe("Timezone"),
  currency: z.string().max(10).default("INR").optional().describe("Currency"),
  localeCode: z.string().max(20).default("en-IN").optional().describe("Locale Code"),
  location: z.object({
    countryCode3: z.string().length(3).describe("Country Code"),
    stateCode: z.string().max(10).describe("State Code"),
  }).describe("Location"),
});

const updateOrgDto = z.object({
  name: z.string().min(2).max(80).optional().describe("Name"),
  alias: z.string().min(2).max(80).optional().describe("Alias"),
  address: z.string().optional().describe("Address"),
  gstNo: z.string().optional().describe("GST Number"),
  financialYear: z.object({
    start: z.string().describe("Start Date"),
    end: z.string().describe("End Date"),
  }).optional().describe("Financial Year"),
  panNo: z.string().length(10).optional().describe("PAN Number"),
  telephone: z.string().optional().describe("Telephone"),
  web: z.string().optional().describe("Website"),
  email: z.string().email().optional().describe("Email"),
});

module.exports = {
  createOrgDto,
  updateOrgDto,
};
