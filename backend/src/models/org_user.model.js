const { Schema, model, Types } = require("mongoose");

const orgUserSchema = new Schema(
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
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const OrgUser = model("organization_user", orgUserSchema);

module.exports = OrgUser;
