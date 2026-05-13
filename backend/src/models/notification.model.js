const { Schema, Types, model } = require("mongoose");

const notificationSchema = new Schema(
    {
        org: {
            type: Types.ObjectId,
            ref: "organization",
            required: true,
        },
        user: {
            type: Types.ObjectId,
            ref: "user",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["info", "warning", "error", "success"],
            default: "info",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        data: {}
    },
    { timestamps: true, versionKey: false }
);

const Notification = model("notification", notificationSchema);

module.exports = Notification;