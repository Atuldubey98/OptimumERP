const billTools = [
    {
        type: "function",
        function: {
            name: "find_bill",
            description: "Retrieve details of a specific bill or invoice using its number or unique ID.",
            parameters: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["invoices", "purchaseOrders", "estimates", "proformaInvoices", "quotations", "purchases"],
                        description: "The category of the document."
                    },
                    billId: { type: "string", description: "The MongoDB _id of the bill." },
                    billNumber: { type: "string", description: "The human-readable number (e.g., 'INV-001')." },
                },
                required: ["billNumber", "type"]
            },
        }
    },
    {
        type: "function",
        function: {
            name: "create_bill",
            description: "Create a new billing document. Use 'partyId' for existing customers or 'partyDetails' for new ones.",
            parameters: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["invoices", "purchases", "proformaInvoices", "estimates", "purchaseOrders", "quotations"]
                    },
                    partyId: { type: "string", description: "The MongoDB _id of an existing party." },
                    partyDetails: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            billingAddress: { type: "string" },
                            shippingAddress: { type: "string" },
                            gstNo: { type: "string" },
                            panNo: { type: "string" }
                        },
                        required: ["name"]
                    },
                    date: { type: "string", description: "ISO format date string." },
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                code: { type: "string" },
                                quantity: { type: "number" },
                                price: { type: "number" },
                                um: { type: "string" },
                                tax: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            type: { type: "string", enum: ["igst", "sgst", "cgst", "vat", "cess", "sal", "none", "others"] },
                                            percentage: { type: "number" }
                                        }
                                    }
                                }
                            },
                            required: ["name", "quantity", "price"]
                        }
                    }
                },
                required: ["type", "items", "date"]
            }
        }
    },
];

module.exports = billTools;