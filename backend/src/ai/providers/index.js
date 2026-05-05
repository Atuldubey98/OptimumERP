const createOllamaProvider = require("./ollama.provider");
const createGrokProvider = require("./grok.provider");

const providers = {
  ollama: createOllamaProvider,
  grok: createGrokProvider,
};

const getProvider = (providerType, config) => {
  const createProvider = providers[providerType.toLowerCase()];

  if (!createProvider) {
    throw new Error(`Unsupported AI provider: ${providerType}`);
  }

  return createProvider(config);
};

module.exports = { getProvider };
