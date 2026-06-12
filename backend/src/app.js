const express = require("express");
const userRouter = require("./routes/users.routes");
const errorHandler = require("./handlers/error.handler");
const path = require("path");
const morgan = require("morgan");
const organizationRouter = require("./routes/org.routes");
const propertyRouter = require("./routes/property.routes");
const { NODE_ENV } = require("./config");
const sessionHandler = require("./handlers/session.handler");
const corsHandler = require("./handlers/cors.handler");
const { authenticate } = require("./middlewares/auth.middleware");
const logger = require("./logger");
const app = express();
const middleware = require("i18next-http-middleware");
const i18 = require("./i18");
const { folders, getRouteFromFolder } = require("./storages");
if (NODE_ENV === "production") app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

if (process.env.NETWORK_STORAGE_PATH) {
  logger.info(`Using network storage at ${process.env.NETWORK_STORAGE_PATH}`);
  const storages = Object.values(folders);
  for (let folder of storages) {
    const folderPath = path.join(process.env.NETWORK_STORAGE_PATH, folder);
    const route = getRouteFromFolder(folder);
    app.use(route, express.static(folderPath));
  }
}

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(corsHandler);
app.use(sessionHandler);
app.use(express.static(path.join(__dirname, "../public")));

app.use(middleware.handle(i18));
app.get("/api/v1/health", (req, res) => {
  res.status(200).send(req.t("health:health"));
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/property", authenticate, propertyRouter);

app.use("*", (req, res) =>
  res.status(404).json({ message: `${req.originalUrl} not found on server` }),
);
app.use(errorHandler);
module.exports = app;
