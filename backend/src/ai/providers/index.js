const { createGroq } = require("@ai-sdk/groq");
const { createOpenAI } = require("@ai-sdk/openai");

const processImage = (base64Image) => {
  if (typeof base64Image !== "string") return base64Image;
  if (base64Image.startsWith("data:")) return base64Image.split(",")[1];
  return base64Image;
};

const providerConfigs = {
  grok: ({ apiKey }) => createGroq({ apiKey }),

  ollama: ({ apiKey, host }) =>
    createOpenAI({
      baseURL: `${host || process.env.OLLAMA_HOST || "http://localhost:11434"}/v1`,
      apiKey,
    }),
};

const getProvider = (providerType, config) => {
  const factory = providerConfigs[providerType.toLowerCase()];

  if (!factory) {
    throw new Error(`Unsupported AI provider: ${providerType}`);
  }

  return {
    client: factory(config),
    processImage,
  };
};

module.exports = { getProvider };
