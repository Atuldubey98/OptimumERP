const Chat = require("../models/chat.model");

const crudService = require("./crud.service");
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


const clearChat = async (orgId, userId, model) => {
  return await crudService.executeMongoDbTransaction(async (session) => {
    const chat = await Chat.findOne({ org: orgId, user: userId, isActive: true }).session(session);

    if (chat && chat.messages.length > 0) {
      const aiFactory = require("../ai");
      const factory = require("../ai/prompts/factory");

      const { ai, defaultModel } = await aiFactory.getAIInstanceForOrg(orgId);

      if (ai) {
        const prompt = factory.titlePrompt().build();
        const userContent = chat.messages
          .filter(m => m.role === "user")
          .map(m => m.content)
          .join("\n");

        const { response } = await ai.chat(model || defaultModel, {
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: userContent || "New conversation" }
          ]
        });

        if (response?.content) {
          chat.title = response.content.trim().replace(/^"|"$/g, '');
        }
      }
    }

    if (chat) {
      chat.isActive = false;
      await chat.save({ session });
    }

    return chat;
  });
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
};
