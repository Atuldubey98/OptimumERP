const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userRouter = require("./routes/users.routes");
const errorHandler = require("./handlers/error.handler");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const organizationRouter = require("./routes/org.routes");
const { rateLimit } = require("express-rate-limit");
const { NODE_ENV, SESSION_SECRET, MONGO_URI } = require("./config");

const logger = require("./logger");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(limiter);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info("Connected to mongodb");
  })
  .catch(() => {
    logger.error("Some error occured in connecting to mongodb");
  });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.urlencoded({ extended: true }));
const whitelist = [
  "http://localhost:5173",
  "http://localhost:9000",
  "https://app.optimumerp.biz",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  httpOnly: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 14 * 24 * 60 * 60,
  }),
};

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(session(sessionOptions));
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
