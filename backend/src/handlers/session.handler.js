const { Router } = require("express");
const session = require("express-session");
const {
  SESSION_SECRET,
  MONGO_URI,
  SESSION_AGE,
  COOKIE_SECURE,
  COOKIE_SAME_SITE,
} = require("../config");
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
    sameSite: COOKIE_SAME_SITE,
    secure: COOKIE_SECURE,
    maxAge: SESSION_AGE,
  },
};

const sessionHandler = Router();

sessionHandler.use(session(sessionOptions));

module.exports = sessionHandler;