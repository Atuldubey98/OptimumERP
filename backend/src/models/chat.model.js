const { Schema, Types, model } = require("mongoose");

const chatSchema = new Schema(
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
      default: "New conversation",
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["system", "user", "assistant", "tool"],
          required: true,
        },
        content: {
          type: String,
        },
        images: [String],
        tool_calls: [Object],
        tool_call_id: String,
        downloads: [Object],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

chatSchema.index({ org: 1, user: 1, updatedAt: -1 });

const Chat = model("chat", chatSchema);

module.exports = Chat;
