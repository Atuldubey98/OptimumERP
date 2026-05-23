const { z } = require("zod");

const itemSchema = z.object({
  name: z.string().describe("Name"),
  price: z.coerce.number().int().describe("Price"),
  quantity: z.coerce.number().describe("Quantity"),
  code: z.string().optional().describe("Code"),
  um: z.string().optional().describe("Unit of Measurement"),
  tax: z.string().optional().describe("Tax"),
  product: z.string().nullable().optional().describe("Product"),
  gst: z.string().optional().describe("GST"),
});

const baseDocumentFields = {
  party: z.string().describe("Party"),
  billingAddress: z.string().describe("Billing Address"),
  description: z.string().optional().describe("Description"),
  terms: z.string().optional().describe("Terms"),
  org: z.string().optional().describe("Organization"),
  items: z.array(itemSchema).describe("Items"),
  date: z.union([z.string(), z.date()]).describe("Date"),
  shippingCharges: z.coerce.number().int().min(0).default(0).optional().describe("Shipping Charges"),
  createdBy: z.string().optional().describe("Created By"),
  updatedBy: z.string().optional().describe("Updated By"),
  poNo: z.coerce.string().optional().describe("PO Number"),
  poDate: z.string().optional().describe("PO Date"),
  prefix: z.string().optional().describe("Prefix"),
  sequence: z.coerce.number().optional().describe("Sequence"),
  status: z.string().optional().describe("Status"),
};

module.exports = {
  itemSchema,
  baseDocumentFields,
};
