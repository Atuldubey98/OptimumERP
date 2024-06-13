require("dotenv").config({
  path:
    process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});
const app = require("./app");
const http = require("http");
const logger = require("./logger");
const { MONGO_URI } = require("./config");
const { connectDatabase, closeDBConnection } = require("./helpers/db_helper");

connectDatabase(MONGO_URI);
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running on => ${PORT}`);
});

const onHandleExitServer = async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  await closeDBConnection();
  server.close(() => {
    logger.info("HTTP Server closed");
    process.exit(0);
  });
};
process.on("SIGTERM", onHandleExitServer);
process.on("SIGTERM", onHandleExitServer);
process.on("uncaughtException", onHandleExitServer);
