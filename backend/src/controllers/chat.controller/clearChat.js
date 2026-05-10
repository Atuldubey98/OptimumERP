const chatService = require("../../services/chat.service");
const requestAsyncHandler = require("../../handlers/requestAsync.handler");

const clearChat = requestAsyncHandler(async (req, res) => {
  const { chatId, model } = req.body;

  await chatService.clearChat(chatId, model);

  res.status(200).json({
    success: true,
    message: "Chat history cleared successfully.",
  });
});

module.exports = clearChat;
