const taxTools = [
  {
    type: "function",
    function: {
      name: "get_taxes",
      description: "Retrieve all available taxes configured for the organization, including their names, rates (percentage), category, single or grouped types, and component breakdown. Use this to find the correct tax _id before creating a bill or when asked about taxes.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Optional search query to filter taxes by name or category (e.g. 'GST', 'IGST', '18').",
          },
        },
      },
    },
  },
];

module.exports = taxTools;
