const expenseTools = [
  {
    type: "function",
    function: {
      name: "list_expenses",
      description: "List company expenses with optional filters for category and date range.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Filter by expense category name (e.g., 'Electricity', 'Rent')." },
          startDate: { type: "string", description: "Filter by start date (YYYY-MM-DD)." },
          endDate: { type: "string", description: "Filter by end date (YYYY-MM-DD)." },
          date: { type: "string", description: "Filter by a specific date (YYYY-MM-DD)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_expense",
      description: "Record a new expense. If the category doesn't exist, it will be created automatically.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Brief description of the expense." },
          amount: { type: "number", description: "The total amount of the expense." },
          category: { type: "string", description: "The category of the expense (e.g., 'Travel', 'Meals')." },
          date: { type: "string", description: "The date of the expense (YYYY-MM-DD). Defaults to today." },
        },
        required: ["description", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_expense_categories",
      description: "List all available expense categories.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_expense_category",
      description: "Create a new category for grouping expenses.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the category." },
        },
        required: ["name"],
      },
    },
  },
];

module.exports = expenseTools;
