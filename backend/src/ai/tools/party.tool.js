const partyTools = [
    {
    type: "function",
    function: {
      name: "get_parties",
      description: "Search and retrieve parties. Supports fetching a specific party's details by their unique ID (partyId) or exact name, or listing multiple parties using a search query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query to match party names (partial or full)."
          },
          partyId: {
            type: "string",
            description: "The MongoDB _id of a specific party to look up details for."
          },
          name: {
            type: "string",
            description: "The exact name of a specific party to look up."
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default 10)."
          },
          page : {
            type: "number",
            description: "Refers to the page at which we are (default 1)."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_party",
      description: "Create a new party/customer record. The party's name may appear anywhere in the user's message — including on the very next line after the request. Always extract and include the name, even if it is on a separate line.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the party. Look carefully — it may appear on a new line immediately after the request." },
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