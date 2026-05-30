const express = require("express");
const router = express.Router({ mergeParams: true });
const { clearChat, paginate, read, generate } = require("../controllers/chat.controller");
const { checkPlan } = require("../middlewares/auth.middleware");

router.use(checkPlan(["platinum"]));

router.post("/clear", clearChat);
router.post("/generate", generate);
router.get("/", paginate);
router.get("/:id", read);

module.exports = router;
