const { isValidObjectId } = require("mongoose");
const { contactDto } = require("../../dto/contact.dto");
const contactService = require("../../services/contact.service");
const { ContactNotFound } = require("../../errors/contact.error");

const formalizeContactForAi = (contact) => {
  return {
    _id: contact._id,
    name: contact.name,
    partyName: contact?.party?.name,
    email: contact?.email,
    telephone: contact?.telephone,
    type: contact?.type,
  }
}
const contactHandler = {
  create_contact: async ({ org, createdBy, user, ...params }) => {
    const body = await contactDto.parseAsync({ ...params, createdBy: createdBy?.toString() });
    const contact = await contactService.create({
      ...body,
      org,
    });
    return formalizeContactForAi(await contact.populate("party", "name"));
  },
  get_contacts: async (params) => {
    const filter = {
      org: params.org,
    };
    if (params.party && isValidObjectId(filter.party)) {
      filter.party = params.party;
    }
    if (params.query) filter.$text = { $search: params.query };

    const contacts = await contactService.getAll({
      filter,
      limit: 10,
      sort: params.query ? { score: { $meta: "textScore" } } : { createdAt: -1 },
      shouldPaginate: false,
    });
    return contacts.map(formalizeContactForAi);
  },
  get_contact: async (params) => {
    if (!isValidObjectId(params.contactId)) {
      throw new Error("Invalid contact ID");
    }
    const contact = await contactService.getById(params.contactId);
    if (!contact || contact.org.toString() !== params.org.toString()) {
      throw new ContactNotFound();
    }
    return formalizeContactForAi(contact);
  },
};

module.exports = contactHandler;
