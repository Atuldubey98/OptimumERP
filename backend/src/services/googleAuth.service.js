const { google } = require("googleapis");
exports.getOAuth2Client = (options = {}) => {
  const oAuth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    ...options,
  });
  return oAuth2Client;
};

exports.exchangeCodeForTokens = async ({ auth, code }) => {
  const tokens = await auth.getToken(code);
  return tokens;
};

exports.getUserProfile = async ({ auth }) => {
  const oauth2 = google.oauth2({ version: "v2", auth: auth });
  const { data } = await oauth2.userinfo.get();
  return data;
};

