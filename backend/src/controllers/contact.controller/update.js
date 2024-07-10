const { contactDto } = require("../../dto/contact.dto");
const { ContactNotFound } = require("../../errors/contact.error");
const logger = require("../../logger");
const Contact = require("../../models/contacts.model");

const update = async (req, res) => {
  const body = await contactDto.validateAsync(req.body);
  const updatedContact = await Contact.findOneAndUpdate(
    {
      _id: req.params.id,
      org: req.params.orgId,
    },
    body
  );
  if (!updatedContact) throw new ContactNotFound();
  logger.log("info", `Contact updated with id ${updatedContact.id}`);
  return res
    .status(200)
    .json({ data: updatedContact, message: "Contact updated" });
};

module.exports = update;
