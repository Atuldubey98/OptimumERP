const axios = require("axios");

const createOllamaProvider = (config) => {
  const host = config.host;
  const instance = axios.create({
    baseURL: host || process.env.OLLAMA_HOST,
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  })
  const processImage = (img) => (img.includes(",") ? img.split(",")[1] : img);

  const formatMessages = (messages) => {
    return messages.map((msg) => {
      const cleaned = {
        role: msg.role,
        content: msg.content,
      };
      if (msg.tool_calls) cleaned.tool_calls = msg.tool_calls;
      if (msg.tool_call_id) cleaned.tool_call_id = msg.tool_call_id;
      if (msg.images && msg.images.length > 0) {
        cleaned.images = msg.images.map((img) => processImage(img));
      }
      return cleaned;
    });
  };

  const chat = async ({ model, messages, tools, options }) => {
    try {
      const response = await instance.post(
        `/api/chat`,
        {
          model,
          messages,
          tools,
          options,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

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

  return { chat, listModels, processImage, formatMessages };
};

module.exports = createOllamaProvider;
