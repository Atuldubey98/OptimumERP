const Chat = require("../models/chat.model");
const aiFactory = require("../ai");
const promptFactory = require("../ai/prompts/factory");
const logger = require("../logger");

const sanitizeTitle = (text, maxWords = 4, fallback = "General Inquiry") => {
  if (!text) return fallback;
  const clean = text
    .split("\n")[0]
    .replace(/^(title|topic)\s*:\s*/i, "")
    .replace(/["'`.]/g, "")
    .trim();
  return clean.split(/\s+/).slice(0, maxWords).join(" ") || fallback;
};

const generateChatTitle = async (chat, { model, providerId } = {}) => {
  try {
    const userMessages = chat.messages?.filter((m) => m.role === "user").slice(0, 3) || [];
    if (!userMessages.length) return;

    const { ai, defaultModel } = await aiFactory.getAIInstanceForProvider(chat.org, providerId);
    if (!ai) return;

    const prompt = promptFactory.titlePrompt().build();
    const userContent = userMessages.map((m) => m.content).join("\n");

    const { text } = await ai.stream(model || defaultModel, {
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userContent || "New conversation" },
      ],
      tools: false,
      maxTokens: 15,
      body: { org: chat.org, createdBy: chat.user },
    });

    const title = sanitizeTitle(text);
    await Chat.findByIdAndUpdate(chat._id, { title });
  } catch (error) {
    logger.error(`Failed to generate chat title: ${error.message}`);
  }
};

const getOrCreateActiveChat = async (orgId, userId) => {
  return await Chat.findOneAndUpdate(
    { org: orgId, user: userId, isActive: true },
    { $setOnInsert: { org: orgId, user: userId, isActive: true, messages: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const addMessages = async (chatId, messages) => {
  return await Chat.findByIdAndUpdate(
    chatId,
    { $push: { messages: { $each: messages } } },
    { new: true }
  );
};

const getChatById = async (chatId) => {
  return await Chat.findById(chatId);
};

const clearChat = async (chatId, model, providerId) => {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isActive) return null;

  chat.isActive = false;
  await chat.save();

  if (chat.messages?.length > 0) {
    generateChatTitle(chat, { model, providerId }).catch((err) =>
      logger.error(`Async chat title generation error: ${err.message}`)
    );
  }

  return chat;
};

const isChatActive = async (chatId) => {
  return await Chat.exists({ _id: chatId, isActive: true });
};

module.exports = {
  getOrCreateActiveChat,
  addMessages,
  getChatById,
  clearChat,
  isChatActive,
  generateChatTitle,
};
