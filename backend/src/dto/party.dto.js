const { z } = require("zod");

exports.createPartyDto = z.object({
  name: z.string().min(2).max(80).describe("Name"),
  shippingAddress: z.string().max(150).optional().describe("Shipping Address"),
  billingAddress: z.string().min(3).max(150).describe("Billing Address"),
  gstNo: z.string().optional().describe("GST Number"),
  createdBy: z.string().describe("Created By"),
  updatedBy: z.string().optional().describe("Updated By"),
  panNo: z.string().optional().describe("PAN Number"),
  org: z.string().describe("Organization"),
});

exports.updatePartyDto = z.object({
  name: z.string().min(2).max(80).optional().describe("Name"),
  shippingAddress: z.string().max(150).optional().describe("Shipping Address"),
  billingAddress: z.string().min(3).max(150).optional().describe("Billing Address"),
  gstNo: z.string().optional().describe("GST Number"),
  updatedBy: z.string().optional().describe("Updated By"),
  org: z.string().optional().describe("Organization"),
  panNo: z.string().optional().describe("PAN Number"),
});
