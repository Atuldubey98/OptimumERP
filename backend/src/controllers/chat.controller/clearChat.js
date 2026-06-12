const chatService = require("../../services/chat.service");
const Joi = require("joi");

const clearChat = async (req, res) => {
  const { chatId, model, providerId } = await Joi.object({
    chatId: Joi.string().optional().allow(""),
    model: Joi.string().optional().allow(""),
    providerId: Joi.string().optional().allow(""),
  }).validateAsync(req.body);

  const { orgId } = req.params;
  const userId = req.session.user?._id;

  let targetChatId = chatId;
  if (!targetChatId && orgId && userId) {
    const activeChat = await chatService.getOrCreateActiveChat(orgId, userId);
    targetChatId = activeChat._id;
  }

  await chatService.clearChat(targetChatId, model, providerId);

  return res.status(200).json({
    success: true,
    message: "Chat history cleared successfully.",
  });
};

module.exports = clearChat;

