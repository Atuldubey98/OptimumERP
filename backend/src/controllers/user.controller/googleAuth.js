const UserModel = require("../../models/user.model");
const UserActivatedPlan = require("../../models/userActivatedPlans.model");
const {
  getLimitsForActivePlan,
  createLoggedInUserWithPlanAndLimits,
} = require("../../services/auth.service");
const {
  getOAuth2Client,
  exchangeCodeForTokens,
  getUserProfile,
} = require("../../services/googleAuth.service");
const { googleAuthBodyDto } = require("../../dto/user.dto");

const googleAuth = async (req, res) => {
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
  if (!userProfile.verified_email) throw Error("Verify google account first");
  const googleId = userProfile.id;
  const user = await createGoogleAuthUser({
    googleId,
    userProfile,
    tokens,
  });
  const activatedPlan = await createPlanForUserIfDoesNotExist(user);
  const limits = getLimitsForActivePlan(activatedPlan);
  const loggedInUser = createLoggedInUserWithPlanAndLimits({
    user,
    activatedPlan,
    limits,
  });
  req.session.user = loggedInUser;
  return res.status(200).json({ data: loggedInUser });
};
module.exports = googleAuth;

async function createPlanForUserIfDoesNotExist(user) {
  return await UserActivatedPlan.findOneAndUpdate(
    {
      user: user.id,
    },
    {
      user: user.id,
      purchasedBy: user.id,
    },
    {
      upsert: true,
      new: true,
    }
  );
}

async function createGoogleAuthUser({ googleId, userProfile, tokens }) {
  let user = await UserModel.findOne({
    googleId,
    email: userProfile.email,
  });

  const name = userProfile.given_name
    ? `${userProfile.given_name}  ${userProfile.family_name}`
    : userProfile.email;
  if (!user)
    user = new UserModel({
      name,
      email: userProfile.email,
      googleId,
      attributes: {
        picture: userProfile.picture,
      },
    });
  user.attributes.googleAccessToken = tokens.access_token;
  user.attributes.googleRefreshToken = tokens.refresh_token;
  await user.save();
  return user;
}
