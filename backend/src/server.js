require("dotenv").config({
  path:
    process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});
const app = require("./app");
const http = require("http");
const logger = require("./logger");
const { MONGO_URI, PORT } = require("./config");
const { connectDatabase, closeDBConnection } = require("./services/db.service");
const cluster = require("node:cluster");
const os = require("node:os");
connectDatabase(MONGO_URI);
if (cluster.isPrimary) {
  const noOfCpus = os.cpus().length;
  for (let i = 0; i < noOfCpus; i++) cluster.fork();
} else {
  const server = http.createServer(app);
  server.listen(PORT, () => logger.info(`Server running on ${PORT}`));
  const onHandleExitServer = async () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    await closeDBConnection();
    server.close(() => {
      logger.info("HTTP Server closed");
      process.exit(0);
    });
  };
  process.on("SIGTERM", onHandleExitServer);
}
