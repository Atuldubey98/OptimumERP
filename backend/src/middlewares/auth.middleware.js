const {
  UnAuthenticated,
  UnAuthorizedUser,
  UpgradePlan,
} = require("../errors/user.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const OrgUser = require("../models/orgUser.model");
const User = require("../models/user.model");
const { hasUserReachedCreationLimits } = require("../services/crud.service");

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
  }).select("role").lean().exec();
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

exports.limitEntityCreation = (entityKey) =>
  requestAsyncHandler(async (req, res, next) => {
    const organization = res.locals.organization;
    const reachedLimit = hasUserReachedCreationLimits({
      relatedDocsCount: organization?.relatedDocsCount || {},
      userLimits: req.session?.user?.limits || {},
      key: entityKey,
    });
    if (reachedLimit) return next(new UpgradePlan());
    return next();
  });
