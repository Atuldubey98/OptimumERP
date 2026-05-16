const path = require("path");
const { isValidObjectId } = require("mongoose");
const transporter = require("../../mailer");
const { convertBillToPdfByTemplate } = require("../../services/bill.service");
const Joi = require("joi");
const Contact = require("../../models/contacts.model");
const logger = require("../../logger");
const smtpService = require("../../services/smtp.service");
const Setting = require("../../models/settings.model");
const logService = require("../../services/log.service");
const Org = require("../../models/org.model");
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
  const { pdfBuffer, data: billData } = await convertBillToPdfByTemplate({
    Bill,
    filter,
    NotFound,
    template,
    t,
    language,
  });
  const [settings, organization] = await Promise.all([
    Setting.findOne({ org: req.params.orgId }).lean(),
    Org.findById(req.params.orgId).select("name alias").lean()
  ]);
  const activeSmtpProvider = settings?.smtpProviders?.find((p) => p.isActive);

  const senderName = organization?.alias || organization?.name || "OptimumERP";

  const pdfFileName = `${billData.title || "Bill"}-${billData.num}.pdf`;

  const attachments = [
    {
      filename: pdfFileName,
      content: pdfBuffer,
    },
  ];

  const mailOptions = {
    from: `"${senderName}" <${activeSmtpProvider?.fields?.user || req?.session?.user?.email}>`,
    to: toEmails.join(","),
    cc: ccEmails.join(","),
    subject: body.subject,
    html: body.body,
    attachments,
  };

  const { executeMongoDbTransaction } = require("../../services/crud.service");

  await executeMongoDbTransaction(async (session) => {
    let info;
    if (activeSmtpProvider) {
      const { send: customSend } = await smtpService.getMailerSetup(activeSmtpProvider);
      info = await customSend(
        mailOptions.to,
        mailOptions.cc,
        mailOptions.subject,
        mailOptions.html,
        mailOptions.attachments,
        mailOptions.from
      );
    } else {
      info = await transporter.sendMail(mailOptions);
    }
    logger.info("Email sent: " + info.messageId);
    logger.info("Sending emails to", toEmails)

    await logService.recordActivity({
      org: req.params.orgId,
      user: req.session.user._id,
      docModel: prefixType,
      doc: id,
      action: "sent",
      message: `Emailed to ${toEmails.join(", ")} by ${req.session.user.name}`,
    }, { session });
  });

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

