const { Ollama } = require("ollama");

const createOllamaProvider = (config) => {
  const host = config.host || process.env.OLLAMA_HOST || "http://localhost:11434";
  const ollama = new Ollama({
    host,
    headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined
  });

  const chat = async ({ model, messages, tools, options }) => {
    try {
      const response = await ollama.chat({
        model,
        messages,
        tools: tools && tools.length > 0 ? tools : undefined,
        options: options || {},
        stream: false,
      });

      return {
        message: response.message,
      };
    } catch (error) {
      throw new Error(`Ollama Provider Error: ${error.message}`);
    }
  };

  const listModels = async () => {
    try {
      const response = await ollama.list();
      return response.models.map((m) => m.name);
    } catch (error) {
      throw new Error(`Ollama Provider Error: ${error.message}`);
    }
  };

  return { chat, listModels };
};


module.exports = createOllamaProvider;

