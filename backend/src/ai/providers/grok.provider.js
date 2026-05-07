const axios = require("axios");

const createGrokProvider = (config) => {
  const apiKey = config.apiKey;
  const baseURL = config.host || process.env.GROK_PROVIDER_URL;
  const instance = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const formatMessages = (messages) => {
    return messages.map((msg) => {
      if (msg.role === "user" && msg.images && msg.images.length > 0) {
        const content = [
          { type: "text", text: msg.content || "" }
        ];
        msg.images.forEach(img => {
          // Ensure it has the data URI prefix for Grok/OpenAI
          const imageUrl = img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`;
          content.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        });
        return {
          role: msg.role,
          content,
          ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
          ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id })
        };
      }
      const cleaned = {
        role: msg.role,
        content: msg.content || "",
      };
      if (msg.tool_calls) cleaned.tool_calls = msg.tool_calls;
      if (msg.tool_call_id) cleaned.tool_call_id = msg.tool_call_id;
      return cleaned;
    });
  };

  const chat = async ({ model, messages, tools, options }) => {
    if (!apiKey) {
      throw new Error("Grok API Key is missing. Please set GROK_API_KEY in your .env file.");
    }
    try {
      const payload = {
        model,
        messages,
        ...(tools && tools.length > 0 && { tools }),
        temperature: options?.temperature ?? 0,
      };

      const response = await instance.post(
        `/openai/v1/chat/completions`,
        payload,
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

  const listModels = async () => {
    try {
      const response = await instance.get(`/openai/v1/models`);
      return response.data.data.map((m) => m.id);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      throw new Error(`Grok Provider Error: ${errorMessage}`);
    }
  };

  const processImage = (img) => (img.includes(",") ? img.split(",")[1] : img);

  return { chat, listModels, processImage, formatMessages };
};

module.exports = createGrokProvider;
