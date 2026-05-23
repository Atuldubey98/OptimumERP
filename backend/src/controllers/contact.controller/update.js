const { contactDto } = require("../../dto/contact.dto");
const contactService = require("../../services/contact.service");

const update = async (req, res) => {
  const body = await contactDto.validateAsync(req.body);
  const filter = { _id: req.params.id, org: req.params.orgId };
  const updatedContact = await contactService.update(filter, body);
  return res
    .status(200)
    .json({ data: updatedContact, message: req.t("common:api.contact_updated") });
};

module.exports = update;
