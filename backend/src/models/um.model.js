const { Schema, model, Types } = require("mongoose");
const umSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: 20,
      required: true,
    },
    description: {
      type: String,
      maxLength: 80,
    },
    unit: {
      type: String,
      required: true,
      maxLength: 10,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
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
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
    },
  },
  {
    collection: "ums",
    timestamps: true,
  }
);

const Um = model("ums", umSchema);
umSchema.index({
  name: "text",
  unit: "text",
});
module.exports = Um;
