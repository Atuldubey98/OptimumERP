const OrgUser = require("../../models/orgUser.model");

const getUserOrgs = async (req, res) => {
  const organizations = await OrgUser.find({
    user: req.session.user._id,
  })
    .populate("org")
    .select("org role");
  return res.status(200).json({ data: organizations });
};

module.exports = getUserOrgs;
