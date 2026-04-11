const { ContactNotFound } = require("../../errors/contact.error");
const contactService = require("../../services/contact.service");
const read = async (req, res) => {
  const contact = await contactService.getById(req.params.id);
  if (!contact) throw new ContactNotFound();
  return res.status(200).json({ data: contact });
};

module.exports = read;
