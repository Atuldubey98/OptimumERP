const reportTools = [
  {
    type: "function",
    function: {
      name: "download_report",
      description: "Generate a download link for a specific report (Sales, Purchases, Transactions, etc.) for a given date range.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["sale", "purchase", "transactions", "gstr1", "gstr2"],
            description: "The type of report to generate.",
          },
          startDate: {
            type: "string",
            description: "The start date for the report (YYYY-MM-DD).",
          },
          endDate: {
            type: "string",
            description: "The end date for the report (YYYY-MM-DD).",
          },
        },
        required: ["type", "startDate", "endDate"],
      },
    },
  },
];

module.exports = reportTools;
