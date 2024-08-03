const UserModel = require("../../models/user.model");
const {
  getOAuth2Client,
  exchangeCodeForTokens,
  getUserProfile,
} = require("../../services/googleAuth.service");
const { googleAuthBodyDto } = require("../../dto/user.dto");
const updateGoogleAuth = async (req, res) => {
  const body = await googleAuthBodyDto.validateAsync(req.body);
  const { code, redirectUri } = body;
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
  await updateGoogleAuthInUser({
    googleAccessToken,
    googleId,
    googleRefreshToken: tokens.refresh_token,
    userId: req.session?.user?._id,
  });
  req.session.user = {
    ...req.session.user,
    googleId,
  };
  return res.status(200).json({ message: "SMTP Setup successfull" });
};

module.exports = updateGoogleAuth;

function updateGoogleAuthInUser({
  userId,
  googleId,
  googleAccessToken,
  googleRefreshToken,
}) {
  return UserModel.findByIdAndUpdate(userId, {
    googleId,
    attributes: {
      googleAccessToken,
      googleRefreshToken,
    },
  });
}
