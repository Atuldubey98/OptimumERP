const { Schema, model, Types } = require("mongoose");

const templateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["term", "email"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "templates",
    timestamps: true,
    versionKey: false,
  }
);

templateSchema.index({ org: 1, type: 1 });
templateSchema.index({ type: 1 });
templateSchema.index({ org: 1, createdAt: -1 });

const Template = model("template", templateSchema);

module.exports = Template;
