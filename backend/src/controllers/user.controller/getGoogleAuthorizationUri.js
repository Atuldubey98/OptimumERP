const { getOAuth2Client } = require("../../services/googleAuth.service");

const getGoogleAuthorizationUri = async (req, res) => {
  const scope = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  const parameters = {
    client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
    access_type: "offline",
    scope: "email",
    display: "popup",
    response_type: "code",
    prompt: "consent",
    scope,
  };
  const oAuth2Client = getOAuth2Client();
  const data = oAuth2Client.generateAuthUrl(parameters);
  return res.status(200).json({ data });
};

module.exports = getGoogleAuthorizationUri;
