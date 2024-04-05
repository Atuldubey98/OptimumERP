const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.NODE_MAILER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_USER_NAME,
    pass: process.env.NODE_MAILER_APP_PASSWORD,
  },
});

module.exports = transporter;