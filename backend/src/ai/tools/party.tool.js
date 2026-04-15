const partyTools = [
  {
    type: "function",
    function: {
      name: "get_party",
      description: "Retrieve a specific party's full details using either their unique ID or their exact name.",
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
  {
    type: "function",
    function: {
      name: "get_parties",
      description: "Search for existing parties by name or list all.",
      parameters: {
        type: "object",
        properties: {
          searchQuery: { type: "string", description: "Name or partial name to search for" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_party",
      description: "Update details of an existing party.",
      parameters: {
        type: "object",
        properties: {
          partyId: { type: "string", description: "The MongoDB _id of the party" },
          updates: {
            type: "object",
            properties: {
              billingAddress: { type: "string" },
              shippingAddress: { type: "string" },
              gstNo: { type: "string" }
            }
          }
        },
        required: ["partyId", "updates"]
      }
    }
  }
];

module.exports = partyTools;