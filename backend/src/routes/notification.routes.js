const { Router } = require("express");
const {
    paginate,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    remove
} = require("../controllers/notification.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const notificationRouter = Router({
    mergeParams: true,
});

notificationRouter.get("/", requestAsyncHandler(paginate));
notificationRouter.patch("/mark-all-read", requestAsyncHandler(markAllAsRead));
notificationRouter.patch("/:id/read", requestAsyncHandler(markAsRead));
notificationRouter.patch("/:id/unread", requestAsyncHandler(markAsUnread));
notificationRouter.delete("/:id", requestAsyncHandler(remove));


module.exports = notificationRouter;
