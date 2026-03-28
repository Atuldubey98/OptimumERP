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
    throw new PartyNotDelete({
      reason: req.t("common:api.entity_linked", { entity: transaction.docModel }),
    });
  const contact = await Contact.findOne({
    org: req.params.orgId,
    party: req.params.partyId,
  });
  if (contact)
    throw new PartyNotDelete({
      reason: req.t("common:api.entity_linked", { entity: "contact" }),
    });
  const party = await Party.softDelete({
    _id: req.params.partyId,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.parties": -1 } }
  );
  return res.status(200).json({ message: req.t("common:api.party_deleted") });
};

module.exports = remove;
