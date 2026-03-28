const { Router } = require("express");
const cors = require("cors");
const whitelist = [
  process.env.VITE_APP_URL,
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
  }),
);
module.exports = corsHandler;
