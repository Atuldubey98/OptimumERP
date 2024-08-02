const { default: axios } = require("axios");
const UserModel = require("../../models/user.model");
const {
  getOAuth2Client,
  exchangeCodeForTokens,
  getUserProfile,
} = require("../../services/googleAuth.service");

const googleAuth = async (req, res) => {
  const { code, redirectUri } = req.body;
  const oAuth2Client = getOAuth2Client({ redirectUri });
  const { tokens } = await exchangeCodeForTokens({
    auth: oAuth2Client,
    code,
  });
  const googleAccessToken = tokens.access_token;
  oAuth2Client.setCredentials({
    access_token: googleAccessToken,
    refresh_token: tokens.refresh_token,
  });
  const userProfile = await getUserProfile({ auth: oAuth2Client });
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

function updateGoogleAuth({
  userId,
  googleId,
  googleAccessToken,
  googleRefreshToken,
  picture,
}) {
  return UserModel.findByIdAndUpdate(userId, {
    googleId,
    attributes: {
      googleAccessToken,
      googleRefreshToken,
      picture,
    },
  });
}
