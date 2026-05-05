const axios = require("axios");

const createGrokProvider = (config) => {
  const apiKey = config.apiKey;
  const baseUrl = "https://api.groq.com/openai/v1";

  const chat = async ({ model, messages, tools, options }) => {
    if (!apiKey) {
      throw new Error("Grok API Key is missing. Please set GROK_API_KEY in your .env file.");
    }
    try {
      const payload = {
        model: model || "llama-3.3-70b-versatile",
        messages: messages.map((msg) => {
          const cleaned = {
            role: msg.role,
            content: msg.content || "",
          };
          if (msg.tool_calls) cleaned.tool_calls = msg.tool_calls;
          if (msg.tool_call_id) cleaned.tool_call_id = msg.tool_call_id;
          return cleaned;
        }),
        ...(tools && tools.length > 0 && { tools }),
        temperature: options?.temperature ?? 0,
      };

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      const choice = response.data.choices[0];
      return {
        message: {
          role: choice.message.role,
          content: choice.message.content || "",
          tool_calls: choice.message.tool_calls,
        },
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      throw new Error(`Grok Provider Error: ${errorMessage}`);
    }
  };

  return { chat };
};

module.exports = createGrokProvider;
