const { Router } = require("express");
const cors = require("cors");
const whitelist = [
  "http://localhost:5173",
  "http://localhost:9000",
  "https://app.optimumerp.biz",
];

const corsHandler = Router();
corsHandler.use(
  cors({
    origin: function (origin, callback) {
      const corsOptions =
        whitelist.includes(origin) || !origin
          ? { origin: true }
          : { origin: false };
      callback(null, corsOptions);
    },
    credentials: true,
    maxAge: 86400,
  })
);
module.exports = corsHandler;
