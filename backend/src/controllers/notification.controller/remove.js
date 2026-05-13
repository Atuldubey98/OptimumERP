const notificationService = require("../../services/notification.service");

const remove = async (req, res) => {
    const filter = {
        _id: req.params.id,
        user: req.session.user._id,
        org: req.params.orgId
    };
    await notificationService.deleteNotification(filter);
    return res.status(200).json({ message: "Notification deleted" });
}

module.exports = remove;
