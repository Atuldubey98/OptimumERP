const billTools = [
  {
    type: "function",
    function: {
      name: "find_bill",
      description:
        "Retrieve details of a specific bill or invoice using its number or unique ID.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "invoices",
              "purchaseOrders",
              "estimates",
              "proformaInvoices",
              "quotations",
              "purchases",
            ],
            description: "The category of the document.",
          },
          billId: {
            type: "string",
            description: "The MongoDB _id of the bill.",
          },
          billNumber: {
            type: "string",
            description: "The human-readable number (e.g., 'INV-001').",
          },
        },
        required: ["billNumber", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_bill",
      description:
        "Create a new billing document. Use 'partyId' for existing customers or 'partyDetails' for new ones.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "invoices",
              "purchases",
              "proformaInvoices",
              "estimates",
              "purchaseOrders",
              "quotations",
            ],
          },
          partyId: {
            type: "string",
            description: "The MongoDB _id of an existing party.",
          },
          partyDetails: {
            type: "object",
            properties: {
              name: { type: "string" },
              billingAddress: { type: "string" },
              shippingAddress: { type: "string" },
              gstNo: { type: "string" },
              panNo: { type: "string" },
            },
            required: ["name"],
          },
          invoiceDate: {
            type: "string",
            description:
              "The date of the invoice/bill (YYYY-MM-DD). If not explicitly mentioned, leave this blank.",
          },
          poNo: {
            type: "string",
            description:
              "PO Number, Purchase Order number, or Work Order number.",
          },
          purchaseOrderDate: {
            type: "string",
            description:
              "The Purchase Order (PO) or Work Order (WO) date (YYYY-MM-DD).",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                code: { type: "string", description: "HSN/Code of the system" },
                quantity: { type: "number" },
                price: { type: "number" },
                um: { type: "string" },
                tax: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "igst",
                          "sgst",
                          "cgst",
                          "vat",
                          "cess",
                          "sal",
                          "none",
                          "others",
                        ],
                        description:
                          "If only general GST is specified, use 'others'.",
                      },
                      percentage: { type: "number" },
                    },
                  },
                },
              },
              required: ["name", "quantity", "price"],
            },
          },
        },
        required: ["type", "items"],
      },
    },
  },
];

module.exports = billTools;
