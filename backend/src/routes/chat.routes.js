const express = require("express");
const router = express.Router({ mergeParams: true });
const { clearChat, paginate, read, generate, remove } = require("../controllers/chat.controller");
const { checkPlan } = require("../middlewares/auth.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

router.use(checkPlan(["platinum"]));

router.post("/clear", requestAsyncHandler(clearChat));
router.post("/generate", requestAsyncHandler(generate));
router.get("/", requestAsyncHandler(paginate));
router.get("/:id", requestAsyncHandler(read));
router.delete("/:id", requestAsyncHandler(remove));

module.exports = router;
