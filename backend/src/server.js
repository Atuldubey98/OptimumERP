require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});
const app = require("./app");
const http = require("http");
const logger = require("./logger");

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running on => ${PORT}`);
});
