const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Org = require("../models/org.model");
const OrgUser = require("../models/orgUser.model");
const logger = require("../logger");

exports.checkOrgAuthorization = requestAsyncHandler(async (req, res, next) => {
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const organization = await Org.findById(orgId);
  if (!organization) throw new OrgNotFound();
  logger.info(`Req from ${organization.name}`);
  const orgUser = await OrgUser.findOne({
    user: req.session.user._id,
    org: orgId,
  });
  if (!orgUser) throw new OrgNotFound();

  res.locals.organization = organization;
  next();
});
