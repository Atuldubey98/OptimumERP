const wss = require("../services/ws.service");
const { sessionMiddleware } = require("../handlers/session.handler");
const logger = require("../logger");
const router = require("./router");

const setupWebSocket = (server) => {
  server.on("upgrade", (req, socket, head) => {
    sessionMiddleware(req, {}, () => {
      if (!req.session?.user) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        return socket.destroy();
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    });
  });

  wss.on("connection", (ws, req) => {
    logger.info(`WebSocket connected: user ${req.session.user._id}`);

    ws.on("message", async (data) => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
        return ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      }
      try {
        await router(ws, msg, req);
      } catch (err) {
        logger.error(`WS handler error for type "${msg.type}"`, err);
        ws.send(JSON.stringify({ type: "error", message: "Internal server error" }));
      }
    });

    ws.on("close", () => {
      logger.info(`WebSocket disconnected: user ${req.session.user._id}`);
    });

    ws.on("error", (err) => {
      logger.error("WebSocket error", err);
    });
  });
};

module.exports = setupWebSocket;
