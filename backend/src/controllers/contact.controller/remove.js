const { ContactNotFound } = require("../../errors/contact.error");
const logger = require("../../logger");
const Contact = require("../../models/contacts.model");
const OrgModel = require("../../models/org.model");

const remove = async (req, res) => {
  const deletedContact = await Contact.findOneAndDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });
  if (!deletedContact) throw new ContactNotFound();
  logger.log("info", `Contact deleted with id ${deletedContact.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.contacts": -1 } }
  );
  return res.status(200).json({ message: "Contact deleted" });
};

module.exports = remove;
