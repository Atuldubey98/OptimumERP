require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});
const { connectDatabase, closeDBConnection } = require("./services/db.service");
const { MONGO_URI, PORT = 3000 } = require("./config");
const ws = require("ws");
const getWsHandler = require("./handlers/ws.handler");
const app = require("./app");
const http = require("http");
const logger = require("./logger");

const bootstrap = async () => {
  const connection = await connectDatabase(MONGO_URI);

  const server = http.createServer(app);
  const wss = new ws.Server({ noServer: true });

  const { onClose, onMessage, onUpgrade } = getWsHandler(wss);

  server.on("upgrade", onUpgrade);

  wss.on('connection', (socket, request) => {
    socket.on("message", (data) => onMessage(socket, data, request));
    socket.on("close", onClose);
  });

  try {
    try {
      await connection.connection.db.admin().command({ replSetGetStatus: 1 });
      logger.info("MongoDB replica set is enabled");
    } catch (re) {
      logger.error("CRITICAL: MongoDB replica set is NOT enabled. Transactions required.");
      process.exit(1);
    }

    server.listen(PORT, "0.0.0.0", () => logger.info(`Server running on ${PORT}`));

    const onHandleExitServer = async () => {
      logger.info("Termination signal received: closing server");
      await closeDBConnection();
      server.close(() => {
        logger.info("HTTP Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", onHandleExitServer);
    process.on("SIGINT", onHandleExitServer);

  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
};

bootstrap();