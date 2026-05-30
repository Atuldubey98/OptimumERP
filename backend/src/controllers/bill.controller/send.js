const { isValidObjectId } = require("mongoose");
const Joi = require("joi");
const billService = require("../../services/bill.service");
const contactService = require("../../services/contact.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const Contact = require("../../models/contacts.model");
const mailBodyDto = Joi.object({
  to: Joi.array().items(Joi.string()).default([]),
  cc: Joi.array().items(Joi.string()).default([]),
  body: Joi.string().allow(""),
  subject: Joi.string(),
});
const send = async (options = {}, req, res) => {
  const { NotFound, Bill, prefixType } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const body = await mailBodyDto.validateAsync(req.body);

  if (!body.to.length)
    return res
      .status(200)
      .json({ message: req.t("common:api.select_at_least_one_recipient") });

  const bill = await Bill.findOne({ _id: id, org: req.params.orgId }).select("party").lean();
  if (!bill) throw new NotFound();

  const allContactIds = [...new Set([...body.to, ...body.cc])];
  const contacts = await Contact.find({
    _id: { $in: allContactIds },
    org: req.params.orgId,
  }).lean();

  const invalidContacts = contacts.filter(
    (c) => c.party.toString() !== bill.party.toString()
  );

  if (invalidContacts.length > 0) {
    return res.status(400).json({
      message: req.t("common:api.contacts_belong_to_different_party"),
    });
  }

  const toContacts = contacts.filter(c => body.to.includes(c._id.toString()));
  const ccContacts = contacts.filter(c => body.cc.includes(c._id.toString()));

  const toEmails = toContacts.map((c) => c.email).filter(Boolean);
  const ccEmails = ccContacts.map((c) => c.email).filter(Boolean);

  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const template = req.query.template || "simple";
  const color = req.query.color ? `#${req.query.color.replace(/^#/, "")}` : null;
  const signature = req.query.signature === "true";
  const language = req.query.lng || req.language;
  const t = language && req.i18n
    ? (key, options = {}) => req.i18n.t(key, { ...options, lng: language })
    : req.t;

  await executeMongoDbTransaction(async (session) => {
    await billService.sendBill({
      Bill,
      filter,
      NotFound,
      template,
      t,
      language,
      orgId: req.params.orgId,
      user: req.session.user,
      session,
      prefixType,
      toEmails,
      ccEmails,
      subject: body.subject,
      body: body.body,
      signature,
      color,
    });
  });

  return res.status(201).json({ message: req.t("common:api.attachment_sent") });
};

module.exports = send;

