const { OrgNotFound } = require("../../errors/org.error");
const Org = require("../../models/org.model");
const read = async (req, res) => {
  const org = await Org.findById(req.params.orgId);
  if (!org) throw new OrgNotFound();
  return res.status(200).json({ data: org });
};

module.exports = read;
