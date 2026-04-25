const billTools = [
  {
    type: "function",
    function: {
      name: "download_bill",
      description: "Generate a download link for a specific invoice, purchase, or other billing document by its number or ID.",
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
            ],
            description: "The category of the document.",
          },
          billNumber: {
            type: "string",
            description: "The human-readable number of the bill (e.g., 'INV-001').",
          },
          billId: {
            type: "string",
            description: "The MongoDB _id of the bill.",
          },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_bills",
      description: "Search for multiple documents (invoices, purchases, etc.) using the transaction registry. Supports filtering by party, type, amount, and date.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "invoice",
              "purchase",
              "expense",
              "quotes",
              "proforma_invoice",
              "purchase_order",
              "payment_voucher",
            ],
            description: "Filter by document type.",
          },
          partyName: {
            type: "string",
            description: "Filter by party name (customer or vendor).",
          },
          minAmount: {
            type: "number",
            description: "Minimum total amount in decimal.",
          },
          maxAmount: {
            type: "number",
            description: "Maximum total amount in decimal.",
          },
          startDate: {
            type: "string",
            description: "Start date (YYYY-MM-DD).",
          },
          endDate: {
            type: "string",
            description: "End date (YYYY-MM-DD).",
          },
          date: {
            type: "string",
            description: "Specific date (YYYY-MM-DD).",
          },
        },
      },
    },
  },
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
           num: {
            type: "string",
            description:
              "REQUIRED for 'purchases'. The invoice number generated by the party system.",
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
                productId: {
                  type: "string",
                  description: "The MongoDB _id of the product if known.",
                },
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
