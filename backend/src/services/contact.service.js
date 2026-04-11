const { ContactNotFound } = require("../errors/contact.error");
const logger = require("../logger");
const Contact = require("../models/contacts.model");
const OrgModel = require("../models/org.model");
const { executeMongoDbTransaction } = require("./crud.service");
const changeOrgContactCount = async ({ orgId, incrementBy, session }) => {
  await OrgModel.updateOne(
    { _id: orgId },
    { $inc: { "relatedDocsCount.contacts": incrementBy } },
    { session },
  );
};
const create = async (data) => {
  const contact = await executeMongoDbTransaction(async (session) => {
    const contact = new Contact(data);
    await contact.save({ session });
    logger.log("info", `Contact created with id ${contact.id}`);
    await changeOrgContactCount({
      orgId: data.org,
      incrementBy: 1,
      session,
    });
    return contact;
  });
  return contact;
};
const getAll = async ({ filter, skip, limit, sort }) => {
  const contacts = await Contact.find(filter)
    .populate("party", "name")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
  return contacts;
};
const getById = async (id) => {
  const contact = await Contact.findById(id).populate("party", "name").lean();
  return contact;
};
const remove = async (filter = { org: null, _id: null }) => {    
  const deleteContact = executeMongoDbTransaction(async (session) => {    
    const deletedContact = await Contact.softDelete(filter);
    if (!deletedContact) throw new ContactNotFound();
    logger.log("info", `Contact deleted with id ${deletedContact.id}`);
    await changeOrgContactCount({
      orgId: filter.orgId,
      incrementBy: -1,
      session,
    });
    return deletedContact;
  });
  return deleteContact;
};

const contactService = {
  create,
  getAll,
  getById,
  remove,
};

module.exports = contactService;
