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
        },
      }
    }
  },
   {
    type: "function",
    function: {
      name: "get_parties",
      description: "Search and retrieve multiple parties using a partial name or search query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query to match party names (partial or full)."
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default 10)."
          },
          page : {
            type: "number",
            description: "Refers to the page at which we are (default 1)."
          }
        },
        required: ["query"]
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
 {
    type: "function",
    function: {
      name: "get_party_ledger",
      description: "Get ledger entries for a party. Supports duration (last 30/90 days) or defaults to financial year.",
      parameters: {
        type: "object",
        properties: {
          partyId: { type: "string" },
          name: { type: "string" },
          duration: {
            type: "string",
            enum: ["7d", "30d", "60d", "90d", "1w", "1m"]
          },
          useFinancialYear: {
            type: "boolean",
            description: "If true, filter using current financial year"
          }
        }
      }
    }
  }
];

module.exports = partyTools;