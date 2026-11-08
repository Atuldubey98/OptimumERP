const aiFactory = require("../../ai");
const authService = require("../../services/auth.service");
const chatService = require("../../services/chat.service");
const propertyService = require("../../services/property.service");
const renderEngineService = require("../../services/renderEngine.service.js");
const factory = require("../../ai/prompts/factory");
const logger = require("../../logger");
const config = require("../../config");
const { dateUtils } = require("../../utils.js");

const pruneHistory = (messages, maxMessages = 25) => {
  if (messages.length <= maxMessages) return messages;

  const systemMessage = messages.find(m => m.role === "system");
  const nonSystemMessages = messages.filter(m => m.role !== "system");

  let pruned = nonSystemMessages.slice(-maxMessages);

  while (pruned.length > 0 && pruned[0].role === "tool") {
    const firstIndex = nonSystemMessages.indexOf(pruned[0]);
    if (firstIndex > 0) {
      pruned.unshift(nonSystemMessages[firstIndex - 1]);
    } else {
      break;
    }
  }

  if (systemMessage) {
    return [systemMessage, ...pruned];
  }
  return pruned;
};

const writeEvent = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const sendMessage = async (req, res) => {
  const orgId = req.params.orgId;
  const userId = req.session.user._id;
  const body = req.body;

  const { providerId, model, message, attachment } = body;

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const abortController = new AbortController();

  req.on("close", () => {
    abortController.abort();
  });

  try {
    if (!providerId) {
      writeEvent(res, { event: "error", message: "No AI provider selected. Please select a provider to start chatting." });
      return res.end();
    }

    const orgUser = await authService.findOrgUser(userId, orgId);
    if (!orgUser) {
      writeEvent(res, { event: "error", message: "Unauthorized." });
      return res.end();
    }

    const { ai, settings, providerType } = await aiFactory.getAIInstanceForProvider(orgId, providerId);

    if (!ai) {
      writeEvent(res, { event: "error", message: "Selected AI provider is not available. Please check your settings." });
      return res.end();
    }

    const aiModelsProp = await propertyService.getByName("AI_MODELS");
    const aiModels = aiModelsProp?.value || {};

    const chat = await chatService.getOrCreateActiveChat(orgId, userId);
    const chatId = chat._id;

    let history = chat.messages.map(m => ({
      role: m.role,
      content: m.content,
      images: m.images,
      tool_calls: m.tool_calls,
      tool_call_id: m.tool_call_id,
    }));

    if (history.length === 0 || history[0].role !== "system") {
      const formattedDate = dateUtils.formatterBySetting({
        localeCode: settings?.localeCode,
        timeZone: settings?.org?.timeZone,
      }).format(new Date());
      const systemContent = factory.organizationPrompt({
        organization: settings.org,
        preferences: {
          localeCode: settings.localeCode,
          timeZone: settings.org.timeZone,
          date: formattedDate,
          documentPrefixes: settings.prefixes,
        },
        user: req.session.user,
      }).build();
      history.unshift({ role: "system", content: systemContent });
    }

    writeEvent(res, { event: "ready", chatId });

    const isChatStillActive = await chatService.isChatActive(chatId);
    if (!isChatStillActive) {
      const newChat = await chatService.getOrCreateActiveChat(orgId, userId);
      writeEvent(res, { event: "chat_switched", chatId: newChat._id });
      history = [{ role: "system", content: history.find(m => m.role === "system")?.content }];
    }

    const providerModels = aiModels[providerType] || [];
    const currentModelConfig = providerModels.find(m => m.id === model);
    const isVisionEnabled = currentModelConfig?.vision === true;

    let images = [];
    if (attachment?.type === "application/pdf") {
      images = await renderEngineService.convertPdfToImages(attachment.content);
    } else if (attachment?.type?.startsWith("image/")) {
      images = [attachment.content];
    }

    if (!isVisionEnabled) {
      images = [];
    }

    if (images.length > 0) {
      images = images.map(img => ai.processImage(img));
    }

    const userMessage = {
      role: "user",
      content: message,
      images: isVisionEnabled ? images : undefined,
    };

    history.push(userMessage);

    const aiInputHistory = isVisionEnabled ? history : history.map(m => ({ ...m, images: undefined }));
    const prunedInputHistory = pruneHistory(aiInputHistory, 25);

    const { text, downloads, newMessages, aborted } = await ai.stream(model, {
      messages: prunedInputHistory,
      body: { org: orgId, createdBy: userId, user: req.session.user },
      onProgress: (status) => writeEvent(res, status),
      onChunk: (chunk) => writeEvent(res, { event: "stream_chunk", content: chunk }),
      abortSignal: abortController.signal,
    });

    if (newMessages.length > 0) {
      chatService.addMessages(chatId, [userMessage, ...newMessages])
        .catch(err => logger.error(`Failed to persist messages: ${err.message}`));
    }

    writeEvent(res, {
      event: "stream_end",
      aborted: !!aborted,
      message: aborted ? "Generation stopped." : text,
      downloads: downloads || [],
    });
  } catch (error) {
    logger.error(`Chat Stream Error: ${error.message}`);
    if (config.NODE_ENV === "development") console.log(error);
    writeEvent(res, { event: "error", message: "Unable to process the request." });
  } finally {
    res.end();
  }
};

module.exports = sendMessage;
