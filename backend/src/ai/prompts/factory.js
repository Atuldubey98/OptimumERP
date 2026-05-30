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
        `)
        .context({
            organization,
            preferences,
            currentUser: user,
        });
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
            businessContext: businessContext || undefined,
        });
};

const factory = {
    organizationPrompt,
    titlePrompt,
    generationPrompt,
};

module.exports = factory;