const { PartyNotFound, PartyNotDelete } = require("../../errors/party.error");
const Contact = require("../../models/contacts.model");
const OrgModel = require("../../models/org.model");
const Party = require("../../models/party.model");
const Transaction = require("../../models/transaction.model");

const remove = async (req, res) => {
  if (!req.params.partyId) throw new PartyNotFound();
  const transaction = await Transaction.findOne({
    org: req.params.orgId,
    party: req.params.partyId,
  });
  if (transaction)
    throw new PartyNotDelete({ reason: `${transaction.docModel} is linked` });
  const contact = await Contact.findOne({
    org: req.params.orgId,
    party: req.params.partyId,
  });
  if (contact) throw new PartyNotDelete({ reason: "contact is linked" });
  const party = await Party.findOneAndDelete({
    _id: req.params.partyId,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.parties": -1 } }
  );
  return res.status(200).json({ message: "Party deleted" });
};

module.exports = remove;
