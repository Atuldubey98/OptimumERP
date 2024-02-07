const dotenvPath =
  process.env.NODE_ENV !== "production"
    ? `../.env${`.${process.env.NODE_ENV}`}`
    : "../.env";
require("dotenv").config({
  path: dotenvPath,
});
const app = require("./app");
const http = require("http");
const logger = require("./logger");
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017")
  .then(() => logger.info("connected to mongodb"));
const server = http.createServer(app);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  logger.info(`Server is running on => ${PORT}`);
});
