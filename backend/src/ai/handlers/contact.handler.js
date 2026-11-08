const { isValidObjectId } = require("mongoose");
const { contactDto } = require("../../dto/contact.dto");
const contactService = require("../../services/contact.service");
const { ContactNotFound } = require("../../errors/contact.error");
const { searchUtils } = require("../../utils");
const Contact = require("../../models/contacts.model");

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
    const body = await contactDto.validateAsync({ ...params, createdBy: createdBy?.toString() });
    const contact = await contactService.create({
      ...body,
      org,
    });
    return formalizeContactForAi(await contact.populate("party", "name"));
  },
  get_contacts: async (params) => {
    if (params.contactId) {
      return contactHandler.get_contact(params);
    }
    const filter = {
      org: params.org,
    };
    if (params.party && isValidObjectId(params.party)) {
      filter.party = params.party;
    }
    if (params.query && params.query.trim()) {
      filter.$text = { $search: searchUtils.escapeTextSearch(params.query) };
    }

    const page = Math.max(parseInt(params.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(params.limit, 10) || 10, 1), 25);
    const skip = (page - 1) * limit;

    const [total, contacts] = await Promise.all([
      Contact.countDocuments(filter),
      contactService.getAll({
        filter,
        skip,
        limit,
        sort: params.query ? { score: { $meta: "textScore" } } : { createdAt: -1 },
        shouldPaginate: true,
      }),
    ]);

    return {
      data: contacts.map(formalizeContactForAi),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: total > page * limit,
      },
    };
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
