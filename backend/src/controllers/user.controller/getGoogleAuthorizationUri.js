const config = require("../../config");
const { getOAuth2Client } = require("../../services/googleAuth.service");

const getGoogleAuthorizationUri = async (req, res) => {
  const scope = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  const parameters = {
    client_id: config.GOOGLE_AUTH_CLIENT_ID,
    client_secret: config.GOOGLE_AUTH_CLIENT_SECRET,
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
