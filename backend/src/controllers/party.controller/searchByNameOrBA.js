const Party = require("../../models/party.model");

const searchByNameOrBA = async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.keyword || "";
  if (search) filter.$text = { $search: search };
  const parties = await Party.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ data: parties });
};
module.exports = searchByNameOrBA;
