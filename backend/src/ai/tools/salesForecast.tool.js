const salesForecastTools = [
  {
    type: "function",
    function: {
      name: "forecast_sales",
      description: "Forecast sales and revenue trends based on historical invoices.",
      parameters: {
        type: "object",
        properties: {
          forecastMonths: {
            type: "number",
            description: "The number of future months to forecast (default is 3).",
            default: 3
          }
        }
      }
    }
  }
];

module.exports = salesForecastTools;
