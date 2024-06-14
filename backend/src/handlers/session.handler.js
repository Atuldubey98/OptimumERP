const { Router } = require("express");
const session = require("express-session");
const { SESSION_SECRET, MONGO_URI } = require("../config");
const MongoStore = require("connect-mongo");
const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  httpOnly: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
  }),
};

const sessionHandler = Router();

sessionHandler.use(session(sessionOptions));

module.exports = sessionHandler;
