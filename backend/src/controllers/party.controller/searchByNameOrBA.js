const Party = require("../../models/party.model");
const { escapeTextSearch } = require("../../utils");

const searchByNameOrBA = async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.keyword || "";
  if (search) filter.$text = { $search: escapeTextSearch(search) };
  const parties = await Party.find(filter).sort({ createdAt: -1 }).lean();
  return res.status(200).json({ data: parties });
};
module.exports = searchByNameOrBA;
