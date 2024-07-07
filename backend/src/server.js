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
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

  logger.info(`the server started listining on port ${bind}`, "info");
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;
  switch (error.code) {
    case "EACCES":
      logger.info(`${bind} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      logger.info(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

server.on("error", onError);
server.on("listening", onListening);
server.listen(PORT);

const onHandleExitServer = async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  await closeDBConnection();
  server.close(() => {
    logger.info("HTTP Server closed");
    process.exit(0);
  });
};
process.on("SIGTERM", onHandleExitServer);
