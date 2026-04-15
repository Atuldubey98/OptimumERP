const { Ollama } = require("ollama");
const getHandler = require("./handlers");
const tools = require("./tools");
const ollama = new Ollama({
    host: "https://ollama.com",
    headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`
    }
});

const chat = async (model, body) => {
    const messages = [...body.messages];
    const response = await ollama.chat({
        model: model,
        messages,
        tools
    });

    const message = response.message;
    if (!message.tool_calls || message.tool_calls.length === 0) {
        return message;
    }

    messages.push(message);

    for (const tool of message.tool_calls) {
        const handler = getHandler(tool.function.name);                
        if (handler) {
            const result = await handler({ ...tool.function.arguments, org: body.org, createdBy: body.createdBy });
            messages.push({
                role: "tool",
                content: JSON.stringify(result),
                tool_call_id: tool.id
            });
        }
    }

    const finalResponse = await ollama.chat({
        model: model,
        messages: messages
    });

    return finalResponse.message;
};

module.exports = {
    chat
}