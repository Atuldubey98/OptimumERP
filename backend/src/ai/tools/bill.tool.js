const billTools = [
    {
        type: "function",
        function: {
            name: "find_bill",
            description: "Retrieve details of a specific bill or invoice using its number or unique ID. Use this when a user asks about a specific transaction or provides an invoice number.",
            parameters: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["invoices", "purchaseOrders", "estimates", "proformaInvoices", "quotations", "purchases"],
                        description: "The category of the document to find."
                    },
                    billId: {
                        type: "string",
                        description: "The MongoDB _id of the bill (preferred if known)."
                    },
                    billNumber: {
                        type: "string",
                        description: "The human-readable invoice or bill number (e.g., 'INV-001')."
                    },
                },
                required: ["billNumber", "type"]
            },
        }
    },
    {
    type: "function",
    function: {
        name: "create_bill",
        description: "Create a document. REQUIRED: You must provide EITHER a partyId (if found via get_party) OR the partyDetails (if the party is new). Do not call get_party again if you are providing partyDetails.",
        parameters: {
            type: "object",
            properties: {
                type: { type: "string", enum: ["invoices", "purchases", "estimates"] },
                partyId: { 
                    type: "string", 
                    description: "The MongoDB _id from get_party. Leave empty if using partyDetails." 
                },
                partyDetails: {
                    type: "object",
                    description: "Provide this ONLY if partyId is unknown. Do not use both.",
                    properties: {
                        name: { type: "string" },
                        billingAddress: { type: "string" }
                    }
                },
                date: { type: "string" },
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            description: { type: "string" },
                            qty: { type: "number" },
                            rate: { type: "number" },
                            tax: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        type: { type: "string", enum: ["igst", "sgst", "cgst"] },
                                        percentage: { type: "number" }
                                    }
                                }
                            }
                        },
                        required: ["description", "qty", "rate"]
                    }
                }
            },
            required: ["type", "items", "date"]
        }
    }
}
];

module.exports = billTools;