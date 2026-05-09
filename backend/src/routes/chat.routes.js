const express = require("express");
const router = express.Router({ mergeParams: true });
const clearChat = require("../controllers/chat.controller/clearChat");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

router.post("/clear", requestAsyncHandler(clearChat));

module.exports = router;
