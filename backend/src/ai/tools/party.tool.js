const partyTools = [
  {
    type: "function",
    function: {
      name: "get_party",
      description: "Retrieve/Get/Find a specific party's full details using either their unique ID or their exact name.",
      parameters: {
        type: "object",
        properties: {
          partyId: {
            type: "string",
            description: "The MongoDB _id of the party (preferred if known)."
          },
          name: {
            type: "string",
            description: "The exact name of the party to look up."
          },
          duration: {
            type: "enum",
            description: "Optional relative duration like '7d', '30d', '60d', '90d', '1w', '1m'. If provided, backend can compute startDate."
          }
        },
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_party",
      description: "Create a new party/customer record.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the party" },
          billingAddress: { type: "string" },
          shippingAddress: { type: "string" },
          gstNo: { type: "string" },
          panNo: { type: "string" }
        },
        required: ["name", "billingAddress"]
      }
    }
  },
];

module.exports = partyTools;