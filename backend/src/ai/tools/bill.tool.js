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
              "invoice",
              "purchase",
              "proforma_invoice",
              "quotes",
              "purchase_order",
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
          partyId: {
            type: "string",
            description: "Filter by party ID (MongoDB _id).",
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
              "invoice",
              "purchase",
              "proforma_invoice",
              "quotes",
              "purchase_order",
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
              "invoice",
              "purchase",
              "proforma_invoice",
              "quotes",
              "purchase_order",
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
          dryRun: {
            type: "boolean",
            description: "If true, the tool will only return the extracted data without saving it to the database. Use this for pre-filling forms.",
          },
          terms: {
            type: "string",
            description: "Custom terms and conditions for this document. Only include if explicitly provided by the user.",
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
  {
    type: "function",
    function: {
      name: "get_activity_log",
      description: "Retrieve the history/activity log of a specific document (invoice, purchase, etc.) to see who created or modified it.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "invoice",
              "purchase",
              "proforma_invoice",
              "quotes",
              "purchase_order",
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
        required: ["type"],
      },
    },
  },
];

module.exports = billTools;
