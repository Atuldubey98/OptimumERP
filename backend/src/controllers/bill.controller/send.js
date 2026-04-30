const { isValidObjectId } = require("mongoose");
const transporter = require("../../mailer");
const { convertBillToPdfByTemplate } = require("../../services/bill.service");
const Joi = require("joi");
const Contact = require("../../models/contacts.model");
const logger = require("../../logger");
const mailBodyDto = Joi.object({
  to: Joi.array().items(Joi.string()).default([]),
  cc: Joi.array().items(Joi.string()).default([]),
  body: Joi.string().allow(""),
  subject: Joi.string(),
});
const send = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const body = await mailBodyDto.validateAsync(req.body);

  if (!body.to.length)
    return res
      .status(200)
      .json({ message: req.t("common:api.select_at_least_one_recipient") });
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const { toEmails, ccEmails } = await getEmailsFromContactIds(body);
  const template = req.query.template || "simple";
  const language = req.query.lng || req.language;
  const t = language && req.i18n
    ? (key, options = {}) => req.i18n.t(key, { ...options, lng: language })
    : req.t;
  const { pdfBuffer } = await convertBillToPdfByTemplate({
    Bill,
    filter,
    NotFound,
    template,
    t,
    language,
  });
  const info = await transporter.sendMail({
    from: `"OptimumERP" <${req?.session?.user?.email}>`,
    to: toEmails.join(","),
    cc: ccEmails.join(","),
    subject: body.subject,
    text: body.body,
    attachments: [
      {
        filename: "Bill.pdf",
        content: pdfBuffer,
      },
    ],
  });
  logger.info("Email sent: " + info.messageId);
  logger.info("Sending emails to", toEmails)

  return res.status(201).json({ message: req.t("common:api.attachment_sent") });
};

module.exports = send;

async function getEmailsFromContactIds(body) {
  const [toContacts, ccContacts] = await Promise.all([
    getContactEmailsByIds(body.to),
    getContactEmailsByIds(body.cc),
  ]);
  const selectOnlyEmail = (contact) => contact.email;
  const toEmails = toContacts.map(selectOnlyEmail);
  const ccEmails = ccContacts.map(selectOnlyEmail);
  return { toEmails, ccEmails };
}



function getContactEmailsByIds(contactIds = []) {
  return Contact.find({
    _id: { $in: contactIds },
    email: { $ne: "" },
  })
    .select("email")
    .lean();
}
