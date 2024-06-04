const express = require("express");
const userRouter = require("./routes/users.routes");
const errorHandler = require("./handlers/error.handler");
const path = require("path");
const morgan = require("morgan");
const organizationRouter = require("./routes/org.routes");
const { NODE_ENV, MONGO_URI } = require("./config");
const { connectDatabase } = require("./helpers/db_helper");
const sessionHandler = require("./handlers/session.handler");
const corsHandler = require("./handlers/cors.handler");
const app = express();

connectDatabase(MONGO_URI);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.urlencoded({ extended: true }));
app.use(corsHandler);

if (NODE_ENV === "production") app.set("trust proxy", 1);

app.use(sessionHandler);

app.get("/", (req, res) => {
  const user = req.session.user;
  res.render("landing", {
    title: "Optimum ERP",
    user,
  });
});
app.get("/api/v1/health", (_, res) =>
  res.status(200).send("Server is running")
);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations", organizationRouter);

app.use("*", (req, res) => {
  return res
    .status(404)
    .json({ message: `${req.originalUrl} not found on server` });
});
app.use(errorHandler);
module.exports = app;
