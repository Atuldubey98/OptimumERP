const notificationService = require("../../services/notification.service");

const markAsUnread = async (req, res) => {
    const filter = {
        _id: req.params.id,
        user: req.session.user._id,
        org: req.params.orgId
    };
    const notification = await notificationService.markAsUnread(filter);
    return res.status(200).json({ data: notification });
}

module.exports = markAsUnread;
