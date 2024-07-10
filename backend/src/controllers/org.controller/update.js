const Org = require("../../models/org.model");
const update = async (req, res) => {
  const updatedOrg = await Org.findByIdAndUpdate(req.params.orgId, req.body, {
    new: true,
  });
  return res
    .status(200)
    .json({ message: "Details updated !", data: updatedOrg });
};
module.exports = update;
