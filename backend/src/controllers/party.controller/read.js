const { PartyNotFound } = require("../../errors/party.error");
const Party = require("../../models/party.model");

const read = async (req, res) => {
  if (!req.params.partyId) throw new PartyNotFound();
  const party = await Party.findOne({
    _id: req.params.partyId,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  return res.status(200).json({ data: party });
};

module.exports = read;
