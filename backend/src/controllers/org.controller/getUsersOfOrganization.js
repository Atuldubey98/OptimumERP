const OrgUser = require("../../models/orgUser.model");

const getUsersOfOrganization = async (req, res) => {
  const organizationUsers = await OrgUser.find({
    org: req.params.orgId,
  })
    .populate("org")
    .populate("user", "name email active role");
  return res.status(200).json({ data: organizationUsers });
};

module.exports = getUsersOfOrganization;
