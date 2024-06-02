const { contactDto } = require("../dto/contact.dto");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Contact = require("../models/contacts.model");
const { ContactNotFound } = require("../errors/contact.error");
const logger = require("../logger");
const OrgModel = require("../models/org.model");
const { getPaginationParams } = require("../helpers/crud.helper");
const config = require("../constants/config");
exports.createContact = requestAsyncHandler(async (req, res) => {
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
});

exports.getContacts = requestAsyncHandler(async (req, res) => {
  const { filter, page, limit, skip, total, totalPages } =
    await getPaginationParams({
      req,
      model: Contact,
      modelName: config.CONTACTS,
    });
  const contacts = await Contact.find(filter)
    .populate("party")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return res.status(200).json({
    currentPage: page,
    limit,
    totalPages,
    total,
    data: contacts,
  });
});

exports.updateContact = requestAsyncHandler(async (req, res) => {
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
});
exports.deleteContact = requestAsyncHandler(async (req, res) => {
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
});

exports.getContact = requestAsyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  }).populate("party");
  if (!contact) throw new ContactNotFound();
  return res.status(200).json({ data: contact });
});
