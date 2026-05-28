const contactTools = [
  {
    type: "function",
    function: {
      name: "create_contact",
      description: "Create a new contact in the system.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "Name of the contact. Length between 2 and 40 characters.",
          },
          email: {
            type: "string",
            description: "Email address of the contact. Maximum 40 characters.",
          },
          party: {
            type: "string",
            description: "Party associated with the contact.",
          },
          telephone: {
            type: "string",
            description: "Telephone number of the contact.",
          },
          type: {
            type: "string",
            description:
              "Type classification of the contact.(default : unknown)",
            default: "unknown",
            enum: [
              "unknown",
              "customer",
              "supplier",
              "employee",
              "prospect",
              "partner",
              "government",
              "marketing",
              "internal",
              "service",
              "contractor",
            ],
          },
        },
        required: ["name", "type", "email"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contacts",
      description: "Retrieve a list of contacts with optional filtering, or fetch a specific contact using its unique ID.",
      parameters: {
        type: "object",
        properties: {
          party: {
            type: "string",
            description: "Optional party ObjectId ID to filter contacts by party",
          },
          query: {
            type: "string",
            description: "Search query to find contacts",
          },
          contactId: {
            type: "string",
            description: "Optional unique ID (ObjectId) of a specific contact to retrieve.",
          },
        },
      },
    },
  },
];

module.exports = contactTools;
