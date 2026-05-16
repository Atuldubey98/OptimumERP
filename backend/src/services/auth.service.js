const freePlanLimits = require("../constants/freePlanLimits");
const { UserDuplicate, UnAuthenticated, UnAuthorizedUser } = require("../errors/user.error");
const Otp = require("../models/otp.model");
const UserModel = require("../models/user.model");
const { getHashedString } = require("./hashing.service");
const path = require("path");
const { renderHtml } = require("./renderEngine.service");
const transporter = require("../mailer");
const OrgUser = require("../models/orgUser.model");
const logger = require("../logger");
const { isValidObjectId } = require("mongoose");
exports.registerUser = async ({
  email,
  password,
  name,
  attributes = {},
  active = false,
  verifiedEmail = false,
}) => {
  const existingUser = await UserModel.findByEmailId(email);
  if (existingUser) throw new UserDuplicate();
  const hashedPassword = await getHashedString(password);
  const registeredUser = await UserModel.create({
    email,
    password: hashedPassword,
    name,
    attributes,
    verifiedEmail,
    active,
  });
  return registeredUser;
};

exports.createLoggedInUserWithPlanAndLimits = ({
  user,
  activatedPlan,
  limits,
  features,
}) => {
  return {
    email: user.email,
    name: user.name,
    _id: user._id,
    currentPlan: activatedPlan,
    avatar: user?.avatar,
    limits,
    features,
  };
};

exports.getLimitsForActivePlan = (activatedPlan) => {
  const planData = {
    free: {
      limits: freePlanLimits,
      features: {
      },
    },
    gold: {
      limits: {
      },
      features: {
        smtp: true,
        import_bulk: true
      },
    },
    platinum: {
      limits: {
        organizations: 3,
      },
      features: {
        ai_integration: true,
        byok: true,
        bot: true,
        recurring_invoice: true,
        import_bulk: true
      },
    },
  };
  const planKey = activatedPlan?.plan || "free";
  return planData[planKey] || planData.free;
};

exports.sendOtpEmailToUser = async ({ user, typeOfOtp, subject }) => {
  await Otp.expireOtpByUserId(user._id, typeOfOtp);
  const generatedOtp = await Otp.generateOtpByUserId(user._id, typeOfOtp);
  const locationTemplate = path.join(__dirname, `../views/otp/send_otp.ejs`);
  const html = await renderHtml(locationTemplate, {
    otp: generatedOtp.otp,
    expirationTime: 10,
  });
  const mail = await transporter.sendMail({
    from: `"OptimumERP" <${process.env.NODE_MAILER_EMAIL}>`,
    to: user.email,
    subject,
    html,
  });
  return mail;
};

exports.findOrgUser = async (userId, orgId) => {
  if (!isValidObjectId(orgId) || !isValidObjectId(userId)) return null;
  const orgUser = await OrgUser.findOne({ user: userId, org: orgId }).lean().exec();
  logger.info(`Authorized org user for orgId: ${orgId} - userId: ${userId}`);
  return orgUser;
};