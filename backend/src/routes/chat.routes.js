const express = require("express");
const router = express.Router({ mergeParams: true });
const clearChat = require("../controllers/chat.controller/clearChat");
const paginate = require("../controllers/chat.controller/paginate");
const read = require("../controllers/chat.controller/read");
const { checkPlan } = require("../middlewares/auth.middleware");

router.use(checkPlan(["platinum"]));

router.post("/clear", clearChat);
router.get("/", paginate);
router.get("/:id", read);

module.exports = router;
