const { contactDto } = require("../../dto/contact.dto");
const contactService = require("../../services/contact.service");
const create = async (req, res) => {
  const body = await contactDto.validateAsync(req.body);
  const contact = await contactService.create({
    ...body,
    org: req.params.orgId,
  });
  return res
    .status(200)
    .json({ data: contact, message: req.t("contact:contact:created") });
};

module.exports = create;