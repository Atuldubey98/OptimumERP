const notificationService = require("../../services/notification.service");

const paginate = async (req, res) => {
    const query = {
        ...req.query,
        user: req.session.user._id
    };
    const params = req.params;
    const result = await notificationService.getAll(query, params);
    return res.status(200).json(result);
}

module.exports = paginate;
