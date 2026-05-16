const { Schema, model, Types } = require("mongoose");

const activitySchema = new Schema(
  {
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    docModel: {
      type: String,
      required: true,
      enum: ["invoice",
        "purchase",
        "expense",
        "quotes",
        "proforma_invoice",
        "purchase_order",
        "payment_voucher"],
    },
    doc: {
      type: Types.ObjectId,
      required: true,
      refPath: "docModel",
    },
    action: {
      type: String,
      required: true,
      enum: ["created", "updated", "sent"],
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      messageId: String,
      to: [String],
      cc: [String],
      html: String,
      body: String,
    }
  },
  {
    timestamps: { createdAt: "at", updatedAt: false },
    versionKey: false,
  }
);

activitySchema.index({ org: 1, doc: 1, at: -1 });

const Activity = model("activity", activitySchema);
module.exports = Activity;
