const { Router } = require("express");
const session = require("express-session");
const { SESSION_SECRET, MONGO_URI, NODE_ENV, SESSION_AGE } = require("../config");
const MongoStore = require("connect-mongo");

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    touchAfter: 3600
  }),
  cookie: {
    httpOnly: true,
    sameSite: NODE_ENV === "production" ? "none" : "lax",
    secure: NODE_ENV === "production",
    maxAge: SESSION_AGE,
  },
};

const sessionHandler = Router();

sessionHandler.use(session(sessionOptions));

module.exports = sessionHandler;