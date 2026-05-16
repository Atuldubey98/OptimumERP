const dashboardTools = [
  {
    type: "function",
    function: {
      name: "get_business_stats",
      description: "Get key business statistics and performance indicators for a specific period (thisWeek, thisMonth, thisYear).",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["thisWeek", "thisMonth", "thisYear"],
            description: "The time period to fetch statistics for. Default is 'thisMonth'.",
          },
        },
      },
    },
  },
];

module.exports = dashboardTools;
