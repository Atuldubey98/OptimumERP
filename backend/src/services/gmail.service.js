const { google } = require("googleapis");

exports.sendEmail = async ({
  auth,
  to,
  subject,
  body,
  cc,
  attachmentBuffer,
}) => {
  const gmail = google.gmail({ version: "v1", auth });
  const boundary = "__optimumERP__";
  const base64Attachment = Buffer.from(attachmentBuffer).toString("base64");
  const nl = "\n";
  const message = [
    "MIME-Version: 1.0",
    "Content-Transfer-Encoding: 7bit",
    "to: " + to,
    "cc: " + cc,
    "subject: " + subject,
    "Content-Type: multipart/alternate; boundary=" + boundary + nl,
    "--" + boundary,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit" + nl,
    body + nl,
    "--" + boundary,
    "--" + boundary,
    `Content-Type: Application/pdf; name=Bill.pdf`,
    "Content-Disposition: attachment; filename=Bill.pdf",
    "Content-Transfer-Encoding: base64" + nl,
    base64Attachment,
    "--" + boundary + "--",
  ].join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
  return response.data;
};
