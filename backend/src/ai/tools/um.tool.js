const umTools = [
  {
    type: "function",
    function: {
      name: "get_ums",
      description: "Retrieve the units of measurement (UoM) available in the organization (e.g., pcs, kg, box, hrs). Use this to find the correct unit of measure before creating products, bills, or items.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Optional search query to filter units of measure by name or abbreviation (e.g., 'pcs', 'kg', 'meter').",
          },
        },
      },
    },
  },
];

module.exports = umTools;
