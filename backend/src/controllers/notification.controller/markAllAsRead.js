const notificationService = require("../../services/notification.service");

const markAllAsRead = async (req, res) => {
    const filter = {
        user: req.session.user._id,
        org: req.params.orgId
    };
    await notificationService.markAllAsRead(filter);
    return res.status(200).json({ message: "All notifications marked as read" });
}

module.exports = markAllAsRead;
