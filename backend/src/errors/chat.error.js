class ChatNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "ChatNotFound";
    this.message = "Conversation not found.";
  }
}

class AiProviderNotFound extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "AiProviderNotFound";
  }
}

class AiEngineInitializationFailed extends Error {
  constructor() {
    super();
    this.code = 500;
    this.name = "AiEngineInitializationFailed";
  }
}

module.exports = { ChatNotFound, AiProviderNotFound, AiEngineInitializationFailed };
