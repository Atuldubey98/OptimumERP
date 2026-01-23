const { Schema, model } = require("mongoose");

const JobSchema = new Schema(
  {
    type: { type: String, enum: ["bulk_upload"], required: true, index : true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "user", index : true },
    org : { type: Schema.Types.ObjectId, ref: "organization" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);
const JobModel = model("job", JobSchema);

module.exports = JobModel;
