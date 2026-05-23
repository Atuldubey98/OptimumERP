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


const clearChat = async (chatId, model, providerId) => {
  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isActive) return null;

  const hasMessages = chat.messages.length > 0;
  const messagesContext = hasMessages ? chat.messages.filter(m => m.role === "user").slice(0, 3) : [];
  const orgId = chat.org;
  const userId = chat.user;

  chat.isActive = false;
  await chat.save();

  if (hasMessages) {
    (async () => {
      const aiFactory = require("../ai");
      const factory = require("../ai/prompts/factory");

      let ai, defaultModel;
      if (providerId) {
        ({ ai, defaultModel } = await aiFactory.getAIInstanceForProvider(orgId, providerId));
      } else {
        // Fallback: pick first active provider for title generation
        const settingService = require("../services/setting.service");
        const { decrypt } = require("../services/hashing.service");
        const settings = await settingService.getDetailedSettingForOrg(orgId);
        const activeProvider = settings?.aiProviders?.find((p) => p.isActive);
        if (activeProvider) {
          ({ ai, defaultModel } = await aiFactory.getAIInstanceForProvider(orgId, activeProvider._id.toString()));
        }
      }

      if (ai) {
        const prompt = factory.titlePrompt().build();
        const userContent = messagesContext.map(m => m.content).join("\n");

        const { response } = await ai.chat(model || defaultModel, {
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: userContent || "New conversation" }
          ],
          body: { org: orgId, createdBy: userId },
          options: { tools: [] }
        });

        if (response?.content) {
          const title = response.content.trim().replace(/^"|"$/g, "");
          await Chat.findByIdAndUpdate(chat._id, { title });
        }
      }
    })();
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
};
