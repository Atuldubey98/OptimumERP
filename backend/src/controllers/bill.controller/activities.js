const { isValidObjectId } = require("mongoose");
const Activity = require("../../models/activity.model");

const activities = async (options = {}, req, res) => {
  const { NotFound } = options;
  const { id } = req.params;
  const orgId = req.params.orgId;

  if (!isValidObjectId(id)) throw new NotFound();

  const data = await Activity.find({
    org: orgId,
    doc: id,
  })
    .sort({ at: -1 })
    .populate("user", "name email avatar")
    .lean();

  return res.status(200).json({ data });
};

module.exports = activities;
