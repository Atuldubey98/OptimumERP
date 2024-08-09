const express = require("express");
const userRouter = require("./routes/users.routes");
const errorHandler = require("./handlers/error.handler");
const path = require("path");
const morgan = require("morgan");
const organizationRouter = require("./routes/org.routes");
const { NODE_ENV } = require("./config");
const sessionHandler = require("./handlers/session.handler");
const corsHandler = require("./handlers/cors.handler");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(corsHandler);
app.use(sessionHandler);

if (NODE_ENV === "production") app.set("trust proxy", 1);

app.get("/", (req, res) => {
  const user = req.session.user;
  res.render("landing", {
    title: "Optimum ERP",
    user,
    dashboardUrl: process.env.VITE_APP_URL,
  });
});
app.get("/privacy", (req, res) => {
  res.render("privacy", {
    title: "Optimum ERP",
  });
});
app.get("/terms", (req, res) => {
  res.render("terms", {
    title: "Optimum ERP",
  });
});
app.get("/api/v1/health", (_, res) =>
  res.status(200).send("Server is running")
);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations", organizationRouter);

app.use("*", (req, res) =>
  res.status(404).json({ message: `${req.originalUrl} not found on server` })
);
app.use(errorHandler);
module.exports = app;
