const Groq = require("groq-sdk");

const createGrokProvider = (config) => {
  const apiKey = config.apiKey;
  const baseURL = config.host;

  const client = new Groq({
    apiKey: apiKey,
    baseURL: baseURL || undefined,
  });


  const chat = async ({ model, messages, tools, options }) => {
    if (!apiKey) {
      throw new Error("Grok API Key is missing. Please set GROK_API_KEY in your .env file.");
    }
    try {
      const formattedMessages = messages.map((m) => {
        const { images, ...rest } = m;
        if (images && images.length > 0) {
          const content = [
            { type: "text", text: rest.content || "" },
            ...images.map((img) => ({
              type: "image_url",
              image_url: { url: img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}` },
            })),
          ];
          return { ...rest, content };
        }
        return rest;
      });

      const response = await client.chat.completions.create({
        model,
        messages: formattedMessages,
        ...(tools && tools.length > 0 && { tools }),
        temperature: options?.temperature ?? 0,
      }, { signal: options?.abortSignal });

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

  const processImage = (base64Image) => {
    if (typeof base64Image !== "string") return base64Image;
    if (!base64Image.startsWith("data:")) {
      return `data:image/jpeg;base64,${base64Image}`;
    }
    return base64Image;
  };

  return { chat, listModels, processImage };
};


module.exports = createGrokProvider;

