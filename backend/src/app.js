const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userRouter = require("./routes/users.routes");
const errorHandler = require("./handlers/error.handler");
const { NODE_ENV, SESSION_SECRET, MONGO_URI } = require("./config");
const customerRouter = require("./routes/customers.routes");
const organizationRouter = require("./routes/org.routes");

const app = express();
const cors = require("cors");
const productRouter = require("./routes/product.routes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const whitelist = ["http://localhost:5173"];
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    sameSite: "strict",
    secure: false,
  },
};

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
  sessionOptions.cookie.secure = true;
}
app.use(session(sessionOptions));
app.get("/api/v1/health", (_, res) => {
  return res.status(200).send("Server is running");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations/:orgId/customers", customerRouter);
app.use("/api/v1/organizations/:orgId/products", productRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("*", (req, res) => {
  return res
    .status(404)
    .json({ message: `${req.originalUrl} not found on server` });
});
app.use(errorHandler);
module.exports = app;
