const chatService = require("../../services/chat.service");
const requestAsyncHandler = require("../../handlers/requestAsync.handler");

const clearChat = requestAsyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { model } = req.body;
  const userId = req.session.user._id;

  await chatService.clearChat(orgId, userId, model);

  res.status(200).json({
    success: true,
    message: "Chat history cleared successfully.",
  });
});

module.exports = clearChat;
