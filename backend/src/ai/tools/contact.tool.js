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
          description: {
            type: "string",
            description:
              "Brief details about the contact. Maximum 80 characters.",
          },
          type: {
            type: "string",
            description:
              "Type classification of the contact.(default : unknown)",
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
          createdBy: {
            type: "string",
            description: "Identifier of the user who created the contact.",
          },
          updatedBy: {
            type: "string",
            description: "Identifier of the user who last updated the contact.",
          },
        },
        required: ["name", "type", "email", "createdBy"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contacts",
      description:
        "Retrieve a list of contacts with optional filtering",
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
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contact",
      description: "Retrieve details of a specific contact using its unique ID.",
      parameters: {
        type: "object",
        properties: {
          contactId: {
            type: "string",
            description: "The unique ID (ObjectId) of the contact.",
          },
        },
        required: ["contactId"],
      },
    },
  },
];

module.exports = contactTools;
