const createPromptBuilder = require("./builder");

const organizationPrompt = ({ organization, preferences }) => {
    const builder = createPromptBuilder();
    const routeMap = {
        dashboard: "/:orgId/dashboard",
        profileSettings: "/:orgId/profile-settings",
        pricing: "/:orgId/pricings",
        contacts: "/:orgId/contacts",
        stats: "/:orgId/stats",
        products: "/:orgId/products",
        taxes: "/:orgId/taxes",
        expenses: "/:orgId/expenses",

        parties: {
            list: "/:orgId/parties",
            transactions: "/:orgId/parties/:partyId/transactions",
            contacts: "/:orgId/parties/:partyId/contacts"
        },

        invoices: {
            list: "/:orgId/invoices",
            create: "/:orgId/invoices/create",
            edit: "/:orgId/invoices/:invoiceId/edit"
        },

        purchases: {
            list: "/:orgId/purchases",
            create: "/:orgId/purchases/create",
            edit: "/:orgId/purchases/:purchaseId/edit"
        },

        reports: {
            list: "/:orgId/reports",
            type: "/:orgId/reports/:reportType"
        },

        categories: {
            list: "/:orgId/categories/:type",
            products: "/:orgId/categories/:type/:productCategoryId/products",
            expenses: "/:orgId/categories/:type/:expenseCategoryId/expenses"
        }
    };
    return builder
        .system("You are an assistant for an ERP system")
        .instructions(`
Use the CONTEXT as the source of truth for organization details.
Do not guess GST, PAN, or address. If missing, use tools.
s
Rules:
- Use only routes from CONTEXT.routes
- Always include orgId in path
- Suggest path should be openable as link
- Replace dynamic params only if available in CONTEXT
- If missing params, suggest list or create page instead
- Keep responses concise

TOOL USAGE RULES:
- Call a tool only when required data is missing.
- Never call the same tool again with the same input.
- If a tool has already returned data, use it to answer.
- Do not retry a tool unless the previous result had an error.
- Once you have enough information, generate the final response.
- Do not call unnecessary tools.
        `)
        .context({
            organization,
            preferences,
            routeMap,
        });
};

const factory = {
    organizationPrompt,
};

module.exports = factory;