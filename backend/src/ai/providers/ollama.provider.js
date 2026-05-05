const axios = require("axios");

const createOllamaProvider = (config) => {
  const host = config.host;
  const apiKey = config.apiKey;

  const chat = async ({ model, messages, tools, options }) => {
    try {
      const response = await axios.post(`${host}/api/chat`, {
        model,
        messages,
        tools,
        options,
        stream: false,
      }, {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(`Ollama Provider Error: ${errorMessage}`);
    }
  };

  return { chat };
};

module.exports = createOllamaProvider;
