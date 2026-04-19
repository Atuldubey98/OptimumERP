const productTools = [
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Search for products in the inventory to check current stock levels, pricing, and details. Use this when the user asks about product availability or prices.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The name, category, or partial name of the product to search for. Example: 'laptop' or 'chair'.",
          },
          type: {
            type: "string",
            enum: ["service", "goods"],
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description:
        "Create a new product or service in the inventory. Use this when the user wants to add a new item to the system.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "The name of the product (e.g., 'Ergonomic Office Chair'). Max 150 chars.",
          },
          costPrice: {
            type: "number",
            description: "The purchase price or production cost of the item.",
          },
          sellingPrice: {
            type: "number",
            description: "The price at which the product is sold to customers.",
          },
          description: {
            type: "string",
            description: "Brief details about the product. Max 200 chars.",
          },
          um: {
            type: "string",
            description: `The Unit of Measure. If not directly specified : 
    - Guess 'pcs' for physical products (e.g., Mouse, Laptop).
    - Guess 'kg' or 'ltr' for raw materials/groceries based on name.
    - Guess 'hours' or 'units' for services (e.g., Installation, Consulting).
    - If unsure, default to 'pcs'.`,
          },
          type: {
            type: "string",
            enum: ["goods", "service"],
            description:
              "Inferred from name: 'service' for labor/tasks, 'goods' for physical items.",
          },
          code: {
            type: "string",
            description: "HSN or SAC code for tax purposes.",
          },
        },
        required: ["name", "type", "costPrice"],
      },
    },
  },
];

module.exports = productTools;
