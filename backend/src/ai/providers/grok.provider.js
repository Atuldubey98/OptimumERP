const Groq = require("groq-sdk");

const createGrokProvider = (config) => {
  const apiKey = config.apiKey;
  const baseURL = config.host || process.env.GROK_PROVIDER_URL;
  
  const client = new Groq({
    apiKey: apiKey,
    baseURL: baseURL || undefined,
  });


  const chat = async ({ model, messages, tools, options }) => {

    if (!apiKey) {
      throw new Error("Grok API Key is missing. Please set GROK_API_KEY in your .env file.");
    }
    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        ...(tools && tools.length > 0 && { tools }),
        temperature: options?.temperature ?? 0,
      });

      const choice = response.choices[0];
      return {
        message: {
          role: choice.message.role,
          content: choice.message.content || "",
          tool_calls: choice.message.tool_calls,
        },
      };
    } catch (error) {
      throw new Error(`Grok Provider Error: ${error.message}`);
    }
  };

  const listModels = async () => {
    try {
      const response = await client.models.list();
      return response.data.map((m) => m.id);
    } catch (error) {
      throw new Error(`Grok Provider Error: ${error.message}`);
    }
  };

  return { chat, listModels };
};


module.exports = createGrokProvider;

