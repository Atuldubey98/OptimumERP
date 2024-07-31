const getGoogleAuthorizationUri = async (req, res) => {
  const parameters = {
    client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
    access_type: "offline",
    scope: "email",
    display: "popup",
    response_type: "code",
    prompt: "consent",
  };
  const data = querystring.stringify(parameters);
  return res.status(200).json({ data });
};

module.exports = getGoogleAuthorizationUri;
