const { Schema, Types, model } = require("mongoose");
class Org {
  static findByIdAndUserId(userId, _id) {
    return this.findOne({ _id, createdBy: userId });
  }
}
const orgSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    address: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    panNo: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);
orgSchema.loadClass(Org);
const OrgModel = model("organization", orgSchema);

module.exports = OrgModel;
