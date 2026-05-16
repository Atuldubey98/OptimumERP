const Activity = require("../models/activity.model");
const AuditLog = require("../models/auditLog.model");

exports.recordActivity = async ({ org, user, docModel, doc, action, message, session, data }) => {
  const activity = new Activity({
    org,
    user,
    docModel,
    doc,
    action,
    message,
    data,
  });
  return await activity.save({ session });
};

exports.recordAudit = ({ org, user, docModel, doc, action, changes, session }) => {
  const auditLog = new AuditLog({
    org,
    user,
    docModel,
    doc,
    action,
    changes,
  });
  return auditLog.save({ session });
};
