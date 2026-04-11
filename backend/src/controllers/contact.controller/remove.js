const contactService = require("../../services/contact.service");

const remove = async (req, res) => {
  const contact = await contactService.remove({
    org: req.params.orgId,
    _id: req.params.id,
  });
  return res
    .status(200)
    .json({ message: req.t("contact:contact:deleted"), data: contact.id });
};

module.exports = remove;
