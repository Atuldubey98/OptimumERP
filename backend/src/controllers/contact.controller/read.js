const { ContactNotFound } = require("../../errors/contact.error");
const Contact = require("../../models/contacts.model");

const read = async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  }).populate("party");
  if (!contact) throw new ContactNotFound();
  return res.status(200).json({ data: contact });
};

module.exports = read;
