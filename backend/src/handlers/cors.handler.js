const { Router } = require("express");
const cors = require("cors");
const whitelist = [
  "http://localhost:5173",
  "http://localhost:9000",
  "https://app.optimumerp.biz",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin) || !origin) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  maxAge: 86400,
};
const corsHandler = Router();
corsHandler.use(cors(corsOptions));
module.exports = corsHandler;
