const { Schema, model, Types } = require("mongoose");

const auditLogSchema = new Schema(
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
    },
    doc: {
      type: Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: "at", updatedAt: false },
    versionKey: false,
  }
);

auditLogSchema.index({ org: 1, doc: 1, at: -1 });

const AuditLog = model("audit_log", auditLogSchema);
module.exports = AuditLog;
