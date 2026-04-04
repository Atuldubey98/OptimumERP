const Org = require("../../models/org.model");
const update = async (req, res) => {
  const updatedOrg = await Org.findByIdAndUpdate(req.params.orgId, req.body, {
    new: true,
  });
  const messageKey = req.body.bank
    ? "common:api.bank_details_updated"
    : "common:api.organization_details_updated";
  return res
    .status(200)
    .json({ message: req.t(messageKey), data: updatedOrg });
};
module.exports = update;
