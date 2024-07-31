const { default: axios } = require("axios");
const UserModel = require("../../models/user.model");

const getTokens = async (code, redirectUri) => {
  const clientId = process.env.GOOGLE_AUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  const grandType = "authorization_code";
  const url = "https://oauth2.googleapis.com/token";
  const { data } = await axios.post(
    url,
    {},
    {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: grandType,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
};
const googleAuth = async (req, res) => {
  const { code, redirectUri } = req.body;
  const tokens = await getTokens(code, redirectUri);
  const googleAccessToken = tokens.access_token;
  const userProfile = await getUserProfile(googleAccessToken);
  const googleId = userProfile.id;
  await updateGoogleAuth({
    googleAccessToken,
    googleId,
    googleRefreshToken: tokens.refresh_token,
    picture: userProfile.picture,
    userId: req.session?.user?._id,
  });
  req.session.user = {
    ...req.session.user,
    googleId,
  };
  return res.status(200).json({ message: "SMTP Setup successfull" });
};

module.exports = googleAuth;

async function updateGoogleAuth({
  userId,
  googleId,
  googleAccessToken,
  googleRefreshToken,
  picture,
}) {
  await UserModel.updateOne(
    {
      _id: userId,
    },
    {
      $set: {
        googleId,
        attributes: {
          googleAccessToken,
          googleRefreshToken,
          picture,
        },
      },
    }
  );
}

async function getUserProfile(googleAccessToken) {
  const urlForGettingUserInfo = "https://www.googleapis.com/oauth2/v2/userinfo";
  const { data } = await axios.get(urlForGettingUserInfo, {
    headers: {
      Authorization: `Bearer ${googleAccessToken}`,
    },
  });
  return data;
}
