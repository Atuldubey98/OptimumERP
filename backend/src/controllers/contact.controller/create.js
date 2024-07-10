const { contactDto } = require("../../dto/contact.dto");
const logger = require("../../logger");
const Contact = require("../../models/contacts.model");
const OrgModel = require("../../models/org.model");

const create = async (req, res) => {
  const body = await contactDto.validateAsync(req.body);
  body.org = req.params.orgId;
  const contact = new Contact(body);
  await contact.save();
  logger.log("info", `Contact created with id ${contact.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.contacts": 1 } }
  );
  return res.status(200).json({ data: contact });
};

module.exports = create;
