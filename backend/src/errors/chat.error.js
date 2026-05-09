class ChatNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "ChatNotFound";
    this.message = "Conversation not found.";
  }
}

module.exports = { ChatNotFound };
