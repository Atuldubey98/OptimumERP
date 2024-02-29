const { UnAuthenticated, UnAuthorizedUser } = require("../errors/user.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const OrgUser = require("../models/org_user.model");

exports.authenticate = requestAsyncHandler(async (req, __, next) => {
  if (!req.session.user) next(new UnAuthenticated());
  next();
});

exports.authorize = requestAsyncHandler(async (req, __, next) => {
  const orgUser = await OrgUser.findOne({
    org: req.params.orgId,
    user: req.session.user._id,
  });
  if(!orgUser) next(new UnAuthenticated());
  if (orgUser.role !== "admin") next(new UnAuthorizedUser());
  next();
});
