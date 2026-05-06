const axios = require("axios");

const createOllamaProvider = (config) => {
  const host = config.host;
  const instance = axios.create({
    baseURL: host || process.env.OLLAMA_HOST,
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  })
  const chat = async ({ model, messages, tools, options }) => {
    try {
      const response = await instance.post(`/api/chat`, {
        model,
        messages,
        tools,
        options,
        stream: false,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(`Ollama Provider Error: ${errorMessage}`);
    }
  };

  const listModels = async () => {
    try {
      const response = await instance.get(`/api/tags`);
      return response.data.models.map((m) => m.name);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(`Ollama Provider Error: ${errorMessage}`);
    }
  };

  return { chat, listModels };
};

module.exports = createOllamaProvider;
