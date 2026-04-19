const sessionHandler = require("./session.handler");
const ai = require("../ai");
const authService = require("../services/auth.service");
const logger = require("../logger");
const config = require("../config");
const cacheService = require("../services/cache.service");
const settingService = require("../services/setting.service");
const url = require("url");
const factory = require("../ai/prompts/factory");
const renderEngineService = require("../services/renderEngine.service.js");
function getWsHandlers(wss) {
  const ORG_USER_MESSAGES_CACHE_TTL_SECONDS = Number(
    process.env.EXPENSE_CATEGORY_CACHE_TTL_SECONDS || 20 * 60,
  );
  const buildOrgUserMessagesCacheKey = (userId, orgId) =>
    cacheService.buildKey("orgUserMessages", userId, orgId);

  const getSessionMessage = async (userId, orgId) => {
    const key = buildOrgUserMessagesCacheKey(userId, orgId);
    return cacheService.getOrSet(
      key,
      async () => {
        logger.debug(
          `Messages cache miss for org ${orgId} and user ${userId}; returning empty array`,
        );
        const setting = await settingService.getDetailedSettingForOrg(orgId);
        const dateOptions = {
          timeZone: setting.timeZone,
          year: "numeric",
          month: "long",
          day: "numeric",
        };

        const dateFormatter = new Intl.DateTimeFormat(
          setting.localeCode,
          dateOptions,
        );
        const formattedDate = dateFormatter.format(new Date());
        const content = factory
          .organizationPrompt({
            organization: setting.org,
            preferences: {
              localeCode: setting.localeCode,
              timeZone: setting.timeZone,
              date: formattedDate,
            },
          })
          .build();

        return [
          {
            role: "system",
            content,
          },
        ];
      },
      {
        ttl: ORG_USER_MESSAGES_CACHE_TTL_SECONDS,
        onHit: () => {
          logger.debug(
            `Messages cache hit for org ${orgId} and user ${userId}`,
          );
        },
      },
    );
  };
  const trimMessages = (messages, count = 10) => {
    if (messages.length <= count * 2) return messages;

    return [...messages.slice(0, count), ...messages.slice(-count)];
  };
  const onMessage = async (ws, data, request) => {
    try {
      const body = JSON.parse(data);
      const { query } = url.parse(request.url, true);
      const orgId = request.headers["orgid"] || query.orgId;
      const messages = await getSessionMessage(request.session.user._id, orgId);
      let images = [];
      const attachment = body?.attachment;
      if (attachment?.type === "application/pdf") {
        images = await renderEngineService.convertPdfToImages(
          attachment.content,
        );
      } else if (attachment?.type.startsWith("image/")) {
        images = [attachment.content];
      }
      messages.push({
        role: "user",
        content: body.message,
        images,
      });
      const response = await ai.chat(process.env.OLLAMA_TEXT_MODEL, {
        messages,
        body: {
          org: orgId,
          createdBy: request.session.user._id,
        },
        onProgress: (currentStatusResponse) => {
          ws.send(JSON.stringify(currentStatusResponse));
        },
      });

      ws.send(
        JSON.stringify({
          event: "ai_response",
          message: response.content,
        }),
      );
      cacheService.set(
        buildOrgUserMessagesCacheKey(request.session.user._id, orgId),
        trimMessages([...messages, response]),
      );
    } catch (error) {
      if (config.NODE_ENV === "development") {
        console.log(error);
      }
      ws.send(
        JSON.stringify({
          event: "error",
          message: "Unable to process the request at the moment.",
        }),
      );
    }
  };

  const onClose = () => {};

  const onUpgrade = (request, socket, head) => {
    sessionHandler(request, {}, async () => {
      if (!request.session || !request.session.user) {
        socket.write("HTTP/1.1 401 UnAuthenticated\r\n\r\n");
        socket.destroy();
        return;
      }
      const { query } = url.parse(request.url, true);
      if (!request.headers["orgid"] && !query.orgId) {
        logger.error("Org ID not provided in headers or query parameters");
        socket.write("HTTP/1.1 401 Unauthenticated\r\n\r\n");
        socket.destroy();
        return;
      }
      const orgId = request.headers["orgid"] || query.orgId;
      const orgUser = await authService.findOrgUser(
        request.session.user._id,
        orgId,
      );
      if (!orgUser) {
        logger.error(
          "Org user not found for userId: " +
            request.session.user._id +
            " and orgId: " +
            orgId,
        );
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
    onClose,
  });
}

module.exports = getWsHandlers;
