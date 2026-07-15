const reportTools = [
  {
    type: "function",
    function: {
      name: "download_report",
      description: "Generate a download link for a specific report for a given date range.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["sale", "purchase", "transactions", "gstr1", "gstr2", "profitAndLoss"],
            description: "The type of report to generate. Use 'sale' for sales/invoice report, 'purchase' for purchase report, 'transactions' for payment transactions, 'gstr1' for GST sales summary, 'gstr2' for GST purchase summary, 'profitAndLoss' for profit and loss statement.",
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
