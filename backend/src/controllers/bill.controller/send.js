const { isValidObjectId } = require("mongoose");
const { sendEmail } = require("../../services/gmail.service");
const UserModel = require("../../models/user.model");
const { getOAuth2Client } = require("../../services/googleAuth.service");
const {
  getPdfBufferUsingHtml,
} = require("../../services/renderEngine.service");
const Joi = require("joi");
const { convertBillToHtmlByTemplate } = require("../../services/bill.service");
const Contact = require("../../models/contacts.model");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
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
  const purchasedBy = req.session?.user?.currentPlan?.purchasedBy;
  const oAuth2Client = await setupAuth2ClientByOrgOwnedBy(purchasedBy);
  if (!body.to.length)
    return res.status(200).json({ message: "Select atleast one recipent" });
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const { toEmails, ccEmails } = await getEmailsFromContactIds(body);
  const template = req.query.template || "simple";
  const { html } = await convertBillToHtmlByTemplate({
    Bill,
    filter,
    NotFound,
    template,
  });
  const pdfBuffer = await getPdfBufferUsingHtml(html);

  await sendEmail({
    auth: oAuth2Client,
    body: body.body,
    subject: body.subject,
    to: toEmails.join(","),
    cc: ccEmails.join(","),
    attachmentBuffer: pdfBuffer,
  });
  return res.status(201).json({ message: "Sent attachment" });
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

async function setupAuth2ClientByOrgOwnedBy(purchasedBy) {
  const user = await UserModel.findById(purchasedBy)
    .select("attributes googleId")
    .lean();
  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials({
    access_token: user.attributes.googleAccessToken,
    refresh_token: user.attributes.googleRefreshToken,
  });
  return oAuth2Client;
}

function getContactEmailsByIds(contactIds = []) {
  return Contact.find({
    _id: { $in: contactIds },
    email: { $ne: "" },
  })
    .select("email")
    .lean();
}
