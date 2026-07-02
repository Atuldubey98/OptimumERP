const sessionHandler = require("./session.handler");
const aiFactory = require("../ai");
const authService = require("../services/auth.service");
const logger = require("../logger");
const config = require("../config");
const url = require("url");
const factory = require("../ai/prompts/factory");
const renderEngineService = require("../services/renderEngine.service.js");
const { dateUtils } = require("../utils.js");
const chatService = require("../services/chat.service");
const propertyService = require("../services/property.service");

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

function getWsHandlers(wss) {
  const onConnection = async (ws, request) => {
    try {
      const { query } = url.parse(request.url, true);
      const orgId = request.headers["orgid"] || query.orgId;
      const providerId = query.providerId;
      const userId = request.session.user._id;

      ws.orgId = orgId;
      ws.userId = userId;

      if (!providerId) {
        ws.send(JSON.stringify({ event: "error", message: "No AI provider selected. Please select a provider to start chatting." }));
        return;
      }

      const { ai, settings, providerType } = await aiFactory.getAIInstanceForProvider(orgId, providerId);

      if (!ai) {
        ws.send(JSON.stringify({ event: "error", message: "Selected AI provider is not available. Please check your settings." }));
        return;
      }

      ws.ai = ai;
      ws.settings = settings;
      ws.providerId = providerId;
      ws.providerType = providerType;

      const aiModelsProp = await propertyService.getByName("AI_MODELS");
      ws.aiModels = aiModelsProp?.value || {};

      const chat = await chatService.getOrCreateActiveChat(orgId, userId);
      ws.chatId = chat._id;
      ws.history = chat.messages.map(m => ({
        role: m.role,
        content: m.content,
        images: m.images,
        tool_calls: m.tool_calls,
        tool_call_id: m.tool_call_id
      }));

      if (ws.history.length === 0 || ws.history[0].role !== "system") {
        const formattedDate = dateUtils.formatterBySetting({
          localeCode: ws?.settings?.localeCode,
          timeZone: ws?.settings?.org?.timeZone,
        }).format(new Date());
        const systemContent = factory.organizationPrompt({
          organization: ws.settings.org,
          preferences: {
            localeCode: ws.settings.localeCode,
            timeZone: ws.settings.org.timeZone,
            date: formattedDate,
          },
          user: request.session.user,
        }).build();
        ws.history.unshift({ role: "system", content: systemContent });
      }

      ws.send(JSON.stringify({ event: "ready", message: "Assistant is ready.", chatId: chat._id }));
    } catch (error) {
      logger.error(`Connection Error: ${error.message}`);
      ws.send(JSON.stringify({ event: "error", message: "Failed to initialize session." }));
    }
  };

  const onMessage = async (ws, data, request) => {
    try {
      const body = JSON.parse(data);
      const orgId = ws.orgId;
      const userId = ws.userId;

      if (!ws.ai) {
        return ws.send(JSON.stringify({
          event: "ai_response",
          message: "Please set up your AI provider keys in organization settings.",
        }));
      }

      const providerModels = ws.aiModels[ws.providerType] || [];
      const currentModelConfig = providerModels.find(m => m.id === body.model);
      const isVisionEnabled = currentModelConfig?.vision === true;

      const isChatStillActive = await chatService.isChatActive(ws.chatId);
      if (!isChatStillActive) {
        const chat = await chatService.getOrCreateActiveChat(orgId, userId);
        ws.chatId = chat._id;
        ws.history = [{
          role: "system",
          content: ws.history.find(m => m.role === "system")?.content
        }];
        ws.send(JSON.stringify({ event: "chat_switched", chatId: chat._id }));
      }

      if (body.event === "abort") {
        if (ws.abortController) {
          ws.abortController.abort();
          ws.abortController = null;
        }
        return;
      }

      ws.abortController = new AbortController();
      const signal = ws.abortController.signal;

      let images = [];
      const attachment = body?.attachment;
      if (attachment?.type === "application/pdf") {
        images = await renderEngineService.convertPdfToImages(attachment.content);
      } else if (attachment?.type.startsWith("image/")) {
        images = [attachment.content];
      }

      if (!isVisionEnabled) {
        images = [];
      }

      if (images.length > 0) {
        images = images.map((img) => ws.ai.processImage(img));
      }

      const userMessage = {
        role: "user",
        content: body.message,
        images: isVisionEnabled ? images : undefined,
      };

      ws.history.push(userMessage);

      const aiInputHistory = isVisionEnabled ? ws.history : ws.history.map(m => ({ ...m, images: undefined }));
      const prunedInputHistory = pruneHistory(aiInputHistory, 25);

      const { response, newMessages } = await ws.ai.chat(body.model, {
        messages: prunedInputHistory,
        body: { org: orgId, createdBy: userId, user: request.session.user },
        onProgress: (status) => ws.send(JSON.stringify(status)),
        abortSignal: signal,
      });

      ws.history.push(...newMessages);

      ws.send(JSON.stringify({
        event: "ai_response",
        message: response.content,
        downloads: response.downloads || [],
      }));
      chatService.addMessages(ws.chatId, [userMessage, ...newMessages])
        .catch((err) => logger.error(`Failed to persist messages: ${err.message}`));
    } catch (error) {
      logger.error(`WebSocket Error: ${error.message}`);
      if (config.NODE_ENV === "development") console.log(error);
      ws.send(JSON.stringify({ event: "error", message: "Unable to process the request." }));
    }
  };

  const onClose = (ws) => {
    logger.debug(`AI Chat session closed for user ${ws.user}`);
  };

  const onUpgrade = (request, socket, head) => {
    sessionHandler(request, {}, async () => {
      if (!request.session || !request.session.user) {
        socket.write("HTTP/1.1 401 UnAuthenticated\r\n\r\n");
        socket.destroy();
        return;
      }
      const { query } = url.parse(request.url, true);
      const orgId = request.headers["orgid"] || query.orgId;
      const orgUser = await authService.findOrgUser(
        request.session.user._id,
        orgId,
      );
      if (!orgUser) {
        socket.write("HTTP/1.1 401 UnAuthenticated\r\n\r\n");
        socket.destroy();
        return;
      }
      socket.orgId = orgId;
      wss.handleUpgrade(request, socket, head, (wsInstance) => {
        wss.emit("connection", wsInstance, request);
      });
    });
  };

  return Object.freeze({
    onUpgrade,
    onMessage,
    onConnection,
    onClose,
  });
}

module.exports = getWsHandlers;
