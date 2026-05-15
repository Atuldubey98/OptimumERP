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
        ai_integration: false,
        byok: false,
        on_premise: false,
        bot: false,
      },
    },
    gold: {
      limits: {
        ...freePlanLimits,
        organizations: 3,
        ums: 100,
        taxes: 100,
        expenseCategories: 100,
        productCategories: 100,
        contacts: 2000,
        invoices: 2000,
        paymentVouchers: 2000,
      },
      features: {
        ai_integration: false,
        byok: false,
        on_premise: false,
        bot: false,
      },
    },
    platinum: {
      limits: {
        organizations: 3,
        ums: 999999,
        taxes: 999999,
        expenseCategories: 999999,
        productCategories: 999999,
        contacts: 999999,
        invoices: 999999,
        paymentVouchers: 999999,
      },
      features: {
        ai_integration: true,
        byok: true,
        on_premise: true,
        bot: true,
        recurringInvoices: true,
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