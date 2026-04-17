const sessionHandler = require("./session.handler");
const ai = require("../ai");
const authService = require("../services/auth.service");
const logger = require("../logger");
const config = require("../config");
const cacheService = require("../services/cache.service");
function getWsHandlers(wss) {
    const ORG_USER_MESSAGES_CACHE_TTL_SECONDS = Number(
        process.env.EXPENSE_CATEGORY_CACHE_TTL_SECONDS || 20 * 60,
    );
    const buildOrgUserMessagesCacheKey = (userId, orgId) =>
        cacheService.buildKey("orgUserMessages", userId, orgId);

    const getSessionMessage = async (orgId, userId) => {
        const key = buildOrgUserMessagesCacheKey(userId, orgId);
        return cacheService.getOrSet(
            key,
            async () => {
                logger.debug(
                    `Messages cache miss for org ${orgId} and user ${userId}; returning empty array`,
                );
                return [
                    {
                        role: "system",
                        content: "You are the OptimumERP Manager. Rules: 1. Always call get_party first. 2. If get_party returns empty, use partyDetails in create_bill. 3. NEVER repeat a tool call. 4. Complete all steps automatically."
                    }
                ];
            },
            {
                ttl: ORG_USER_MESSAGES_CACHE_TTL_SECONDS,
                onHit: () => {
                    logger.debug(`Messages cache hit for org ${orgId} and user ${userId}`);
                },
            },
        );
    };
    const trimMessages = (messages, count = 10) => {
        if (messages.length <= count * 2) return messages;

        return [
            ...messages.slice(0, count),
            ...messages.slice(-count)
        ];
    };
    const onMessage = async (ws, data, request) => {
        try {
            const body = JSON.parse(data);
            const messages = await getSessionMessage(request.session.user._id, request.headers["orgid"]);
            messages.push({
                role: "user",
                content: body.message
            });
            const response = await ai.chat("qwen3.5", {
                messages,
                body: {
                    org: request.headers["orgid"],
                    createdBy: request.session.user._id
                }
            });

            ws.send(JSON.stringify({
                event: "ai_response",
                message: response.content
            }));
            cacheService.set(buildOrgUserMessagesCacheKey(request.session.user._id, request.headers["orgid"]), trimMessages([...messages, response]));
        } catch (error) {
            if (config.NODE_ENV === "development") {
                console.log(error);
            }
            ws.send(JSON.stringify({
                event: "error",
                message: "Unable to process the request at the moment."
            }));
        }
    };

    const onClose = () => { };

    const onUpgrade = (request, socket, head) => {
        sessionHandler(request, {}, async () => {
            if (!request.session || !request.session.user) {
                socket.write('HTTP/1.1 401 UnAuthenticated\r\n\r\n');
                socket.destroy();
                return;
            }
            if (!request.headers["orgid"]) {
                socket.write('HTTP/1.1 401 Unauthenticated\r\n\r\n');
                socket.destroy();
                return;
            }
            const orgUser = await authService.findOrgUser(request.session.user._id, request.headers["orgid"]);
            if (!orgUser) {
                socket.write('HTTP/1.1 401 UnAuthenticated\r\n\r\n');
                socket.destroy();
                return;
            }
            socket.orgId = request.headers["orgid"];
            wss.handleUpgrade(request, socket, head, (wsInstance) => {
                wss.emit('connection', wsInstance, request);
            });
        });
    };

    return Object.freeze({
        onUpgrade,
        onMessage,
        onClose
    });
}

module.exports = getWsHandlers;