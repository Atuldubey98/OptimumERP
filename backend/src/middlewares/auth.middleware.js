const {
  UnAuthenticated,
  UnAuthorizedUser,
  UpgradePlan,
} = require("../errors/user.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const OrgModel = require("../models/org.model");
const OrgUser = require("../models/orgUser.model");
const User = require("../models/user.model");

const freePlanLimits = require("../constants/freePlanLimits");
exports.authenticate = requestAsyncHandler(async (req, __, next) => {
  if (!req.session.user) return next(new UnAuthenticated());
  const user = await User.findById(req.session.user._id);
  if (!user.active) return next(new UnAuthenticated());
  next();
});

exports.authorize = requestAsyncHandler(async (req, __, next) => {
  const orgUser = await OrgUser.findOne({
    org: req.params.orgId,
    user: req.session.user._id,
  });
  if (!orgUser) return next(new UnAuthenticated());
  if (orgUser.role !== "admin") return next(new UnAuthorizedUser());
  next();
});

exports.checkPlan = (plans) =>
  requestAsyncHandler(async (req, __, next) => {
    const currentPlan = req.session?.user?.currentPlan?.plan;
    if (plans.includes(currentPlan)) return next();
    return next(new UpgradePlan());
  });

exports.limitFreePlanOnCreateEntityForOrganization = (entityKey) =>
  requestAsyncHandler(async (req, __, next) => {
    const orgId = req.params.orgId;
    const plan = req.session.user.currentPlan?.plan;
    if (plan !== "free") return next();
    const organization = await OrgModel.findById(orgId).select(
      "relatedDocsCount"
    );
    const limit = freePlanLimits[entityKey];
    if (
      organization.relatedDocsCount &&
      organization.relatedDocsCount[entityKey] >= limit
    )
      return next(new UpgradePlan());
    return next();
  });
