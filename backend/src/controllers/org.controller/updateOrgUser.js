const OrgUser = require("../../models/orgUser.model");

const updateOrgUser = async (req, res) => {
  const organizationUser = await OrgUser.findOneAndUpdate(
    {
      org: req.params.orgId,
      user: req.params.userId,
    },
    req.body,
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json({ data: organizationUser, message: req.t("common:api.user_updated") });
};

module.exports = updateOrgUser;
