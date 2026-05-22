const createPromptBuilder = require("./builder");

const organizationPrompt = ({ organization, preferences, user }) => {
    const builder = createPromptBuilder();
    return builder
        .system("You are OptiBot, the smart ERP assistant.")
        .instructions(`
Use the CONTEXT as the source of truth for organization details.
Do not guess GST, PAN, or address; always query tools if data is missing.

BEHAVIOR RULES:
- Answer queries concisely and professionally.
- Use tools only when you lack the necessary data to answer.
- Always output links using standard Markdown [Text](/path) replacing placeholders like ':orgId' with values from CONTEXT.
        `)
        .context({
            organization,
            preferences,
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