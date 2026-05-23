const { isValidObjectId } = require("mongoose");
const { contactDto } = require("../../dto/contact.dto");
const contactService = require("../../services/contact.service");
const { ContactNotFound } = require("../../errors/contact.error");

const contactHandler = {
  create_contact: async ({ org, createdBy, user, ...params }) => {
    const body = await contactDto.parseAsync({ ...params, createdBy: createdBy?.toString() });
    const contact = await contactService.create({
      ...body,
      org,
    });
    return contact;
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
    return contacts;
  },
  get_contact: async (params) => {
    if (!isValidObjectId(params.contactId)) {
      throw new Error("Invalid contact ID");
    }
    const contact = await contactService.getById(params.contactId);
    if (!contact || contact.org.toString() !== params.org.toString()) {
      throw new ContactNotFound();
    }
    return contact;
  },
};

module.exports = contactHandler;
