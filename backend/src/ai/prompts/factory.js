const reportDataByType = require("../../constants/reportDataByType");
const createPromptBuilder = require("./builder");

const organizationPrompt = ({ organization, preferences, user }) => {
    const builder = createPromptBuilder();
    return builder
        .system("You are OptiBot, the smart ERP assistant.")
        .instructions(`
Use the CONTEXT as the source of truth for organization details.
Never guess organization or business details; always use tools if data is missing.
When searching for documents, use the documentPrefixes in the context to identify them.

TOOL USAGE:
- Only offer or perform actions supported by your available tools.
- Only suggest options, reports, or document types that exist in your tools and context. Never assume or invent unsupported features.
- Do not include raw download links in your text; the UI displays download buttons automatically.
- Never reveal internal tool names, functions, or technical schemas to the user. Always describe what you can do in natural, everyday language.

BEHAVIOR RULES:
- Answer queries concisely and professionally.
- Only answer questions relevant to the ERP and business domain.
- Use tools only when you need data to answer.
- Politely decline to answer questions that are outside your domain or scope.
- You are strictly not allowed to generate anything random in the system at all. Never invent, hallucinate, or assume unsupported features, documents, or data.
        `)
        .context({
            organization,
            preferences,
            "Current User": user,
            "Reports Generation Capabilities": Object.keys(reportDataByType)
        });
};

const titlePrompt = () => {
    const builder = createPromptBuilder();
    return builder
        .system("Generate a 2 to 4 word title for this conversation. Output ONLY the title text.")
        .instructions(`
Format: 2-4 words, Title Case, no quotes, no punctuation.
Example: "I need to check unpaid bills" -> Unpaid Bills Check
        `);
};


const generationPrompt = ({ organization, businessContext }) => {
    const builder = createPromptBuilder();
    return builder
        .system("You are a professional business assistant for the ERP system.")
        .instructions(`
Your goal is to generate high-quality text based on the user's request (e.g. Terms and Conditions, email templates, business descriptions).
Generate clear, precise, and professional content.
        `)
        .context({
            organization: {
                name: organization?.name,
                alias: organization?.alias,
            },
            businessContext,
        });
};

const iceBreakersPrompt = ({ capabilities = [] } = {}) => {
    const builder = createPromptBuilder();
    const capList = Array.isArray(capabilities) && capabilities.length > 0
        ? capabilities.map((cap) => `- ${cap}`).join("\n")
        : "";

    return builder
        .system("Suggest 2 or 3 short, relevant follow-up prompts the user might ask next based on the recent assistant message. Output ONLY a valid JSON array of strings.")
        .instructions(`
${capList ? `AVAILABLE CAPABILITIES:\n${capList}\n` : ""}
STRICT BOUNDARIES:
- Only suggest actions from the available capabilities above.
- NEVER suggest external integrations (Shopify, QuickBooks, Slack, etc.), HR, payroll, direct card/bank charges, or unsupported features.

RULES:
- Keep each suggestion short and specific (2 to 5 words, e.g. "Download invoice PDF", "View customer ledger", "Send via email").
- Do not add extra details or explanations in the prompts.
- Return ONLY the JSON array: ["Prompt 1", "Prompt 2", "Prompt 3"]
        `);
};

const iceBreakersUserPrompt = ({ assistantMessage, userMessage, message, userPrompt } = {}) => {
    const builder = createPromptBuilder();
    const cleanAssistant = (assistantMessage || message || "").replace(/\s+/g, " ").trim().slice(0, 200);
    const cleanUser = (userMessage || userPrompt || "").replace(/\s+/g, " ").trim().slice(0, 150);

    const contextText = cleanUser
        ? `User asked: "${cleanUser}"\nAssistant replied: "${cleanAssistant}"`
        : `Assistant replied: "${cleanAssistant}"`;

    return builder
        .user(`Context:\n${contextText}\n\nSuggest 2-3 short follow-up prompts for the user:`);
};

const factory = {
    organizationPrompt,
    titlePrompt,
    generationPrompt,
    iceBreakersPrompt,
    iceBreakersUserPrompt,
};

module.exports = factory;