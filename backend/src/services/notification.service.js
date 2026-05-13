const Notification = require("../models/notification.model");
const Setting = require("../models/settings.model");
const { getPaginationParams, executeMongoDbTransaction } = require("./crud.service");
const { NOTIFICATIONS } = require("../constants/entities");

const create = async (data, session = null) => {
    const operations = async (session) => {
        const notification = new Notification(data);
        await notification.save({ session });
        await Setting.updateOne(
            { org: data.org },
            { $inc: { "sequenceCounters.unReadNotifications": 1 } }
        ).session(session);
        return notification;
    }

    if (session) return await operations(session);
    return await executeMongoDbTransaction(operations);
}


const getAll = async (query, params) => {
    const { filter, skip, limit, page, total, totalPages } = await getPaginationParams({
        query,
        params,
        model: Notification,
        modelName: NOTIFICATIONS
    });

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        notifications,
        total,
        page,
        limit,
        totalPages
    };
}


const markAsRead = async (filter) => {
    return await executeMongoDbTransaction(async (session) => {
        const notification = await Notification.findOneAndUpdate(
            { ...filter, isRead: false },
            { isRead: true },
            { new: true, session }
        );
        if (notification) {
            await Setting.updateOne(
                { org: notification.org },
                { $inc: { "sequenceCounters.unReadNotifications": -1 } }
            ).session(session);
        }
        return notification;
    });
}

const markAsUnread = async (filter) => {
    return await executeMongoDbTransaction(async (session) => {
        const notification = await Notification.findOneAndUpdate(
            { ...filter, isRead: true },
            { isRead: false },
            { new: true, session }
        );
        if (notification) {
            await Setting.updateOne(
                { org: notification.org },
                { $inc: { "sequenceCounters.unReadNotifications": 1 } }
            ).session(session);
        }
        return notification;
    });
}

const markAllAsRead = async (filter) => {
    return await executeMongoDbTransaction(async (session) => {
        const result = await Notification.updateMany(
            { ...filter, isRead: false },
            { isRead: true },
            { session }
        );
        if (result.modifiedCount > 0) {
            await Setting.updateOne(
                { org: filter.org },
                { $inc: { "sequenceCounters.unReadNotifications": -result.modifiedCount } }
            ).session(session);
        }
        return result;
    });
}

const deleteNotification = async (filter) => {
    return await executeMongoDbTransaction(async (session) => {
        const notification = await Notification.softDelete(filter, { session, new: true });
        if (notification && !notification.isRead) {
            await Setting.updateOne(
                { org: notification.org },
                { $inc: { "sequenceCounters.unReadNotifications": -1 } }
            ).session(session);
        }
        return notification;
    });
}





module.exports = {
    create,
    getAll,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
}