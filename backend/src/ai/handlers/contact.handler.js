const { isValidObjectId } = require("mongoose");
const { contactDto } = require("../../dto/contact.dto");
const contactService = require("../../services/contact.service");

const contactHandler = {
  create_contact: async ({ org, createdBy, user, ...params }) => {
    const body = await contactDto.validateAsync({ ...params, createdBy });
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
      sort: { createdAt: -1 },
      shouldPaginate: false,
    });
    return contacts;
  },
};

module.exports = contactHandler;
