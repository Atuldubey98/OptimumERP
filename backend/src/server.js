require("dotenv").config({
  path:
    process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});
const { connectDatabase, closeDBConnection } = require("./services/db.service");
const { MONGO_URI, PORT } = require("./config");
connectDatabase(MONGO_URI);
const app = require("./app");
const http = require("http");
const logger = require("./logger");
const wss = require("./services/ws.service");
const setupWebSocket = require("./ws");
const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => logger.info(`Server running on ${PORT}`));

const onHandleExitServer = async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  await closeDBConnection();
  wss.close(() => logger.info("WebSocket server closed"));
  server.close(() => {
    logger.info("HTTP Server closed");
    process.exit(0);
  });
};
process.on("SIGTERM", onHandleExitServer);