const { updatePartyDto } = require("../../dto/party.dto");
const { PartyNotFound } = require("../../errors/party.error");
const Party = require("../../models/party.model");

const update = async (req, res) => {
  if (!req.params.partyId) throw new PartyNotFound();
  const body = await updatePartyDto.validateAsync(req.body);
  const updatedParty = await Party.findOneAndUpdate(
    { _id: req.params.partyId, org: req.params.orgId },
    body
  );
  if (!updatedParty) throw new PartyNotFound();

  return res.status(200).json({ message: "Party updated !" });
};

module.exports = update;
