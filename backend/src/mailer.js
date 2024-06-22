const nodemailer = require("nodemailer");
const {
  NODE_MAILER_HOST,
  NODE_MAILER_APP_PASSWORD,
  NODE_MAILER_USER_NAME,
} = require("./config");

const transporter = nodemailer.createTransport({
  host: NODE_MAILER_HOST,
  secure: true,
  auth: {
    user: NODE_MAILER_USER_NAME,
    pass: NODE_MAILER_APP_PASSWORD,
  },
});

module.exports = transporter;
