const createPromptBuilder = require("./builder");

const organizationPrompt = ({ organization, preferences, user }) => {
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
        purchaseOrders: {
            list: "/:orgId/purchaseOrders",
            create: "/:orgId/purchaseOrders/create",
            edit: "/:orgId/purchaseOrders/:purchaseId/edit"
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
        .system("You are an assistant for an ERP system. Your name is OptiBot.")
        .instructions(`
Use the CONTEXT as the source of truth for organization details.
Do not guess GST, PAN, or address. If missing, use tools.

LINK GENERATION RULES:
- Use ONLY the routes provided in CONTEXT.routeMap.
- You MUST replace ':orgId' in the path with the actual organization ID from CONTEXT.organization.
- You MUST replace other dynamic parameters (e.g., ':partyId', ':invoiceId') with actual values from the context.
- If a specific ID is missing for a detailed route, fallback to the generic 'list' or 'create' route for that entity.
- Output all links in standard markdown format: [Text](/actual-path).
- Never output unparsed parameters like '/:orgId/invoices' to the user.

TOOL USAGE RULES:
- Call a tool only when required data is missing.
- Never call the same tool again with the same input.
- If a tool has already returned data, use it to answer.
- Do not retry a tool unless the previous result had an error.
- Once you have enough information, generate the final response.
- Do not call unnecessary tools.
- Keep responses concise.
        `)
        .context({
            organization,
            preferences,
            routeMap,
            currentUser: user,
        });
};

const prefillPrompt = ({ type, organization }) => {
    const builder = createPromptBuilder();
    return builder
        .system(`You are a professional data extraction assistant for an ERP system. 
        Your goal is to extract billing information from the provided document accurately.`)
        .instructions(`
        STRICT RULES:
        1. Use the 'create_bill' tool with 'dryRun: true' exactly ONCE to return the extracted data.
        2. Strictly use the suggested document type: '${type}'. Do not attempt to use other types even if the document content suggests otherwise.
        3. Do not guess information. If something is not clear, leave it blank or null.
        4. Once you have called the tool and received the results, simply say "Extraction complete." and stop. Do not call the tool again.
        5. IGNORE YOUR OWN ORGANIZATION: The user's organization is '${organization?.name}'. When extracting 'partyDetails' or 'partyName', ensure you extract the OTHER party mentioned in the document (the customer if this is an invoice, or the vendor if this is a purchase). NEVER extract the user's own organization as the party.
        `);
};

const titlePrompt = () => {
    const builder = createPromptBuilder();
    return builder
        .system("You are a helpful assistant that generates short, concise titles for chat conversations.")
        .instructions(`
            - Analyze the provided conversation history.
            - Generate a short, descriptive title (3-5 words max).
            - The title should reflect the main topic discussed.
            - Output ONLY the title, no quotes or extra text.
            - If the conversation is too short, use "General Inquiry".
        `);
};

const factory = {
    organizationPrompt,
    prefillPrompt,
    titlePrompt,
};

module.exports = factory;