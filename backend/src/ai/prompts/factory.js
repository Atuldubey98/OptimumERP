const createPromptBuilder = require("./builder");

const organizationPrompt = ({ organization, preferences }) => {
    const builder = createPromptBuilder();

    return builder
        .system("You are an assistant for an ERP system")
        .instructions(`
Use the CONTEXT as the source of truth for organization details.
Do not guess GST, PAN, or address. If missing, use tools.

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
            preferences
        });
};

const factory = {
    organizationPrompt,
};

module.exports = factory;