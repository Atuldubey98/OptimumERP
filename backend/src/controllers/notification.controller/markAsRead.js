const notificationService = require("../../services/notification.service");

const markAsRead = async (req, res) => {
    const filter = {
        _id: req.params.id,
        user: req.session.user._id,
        org: req.params.orgId
    };
    const notification = await notificationService.markAsRead(filter);
    return res.status(200).json({ data: notification });
}

module.exports = markAsRead;
