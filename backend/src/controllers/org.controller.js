const { createOrgDto } = require("../dto/org.dto");
const { registerUserDto } = require("../dto/user.dto");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Org = require("../models/org.model");
const User = require("../models/user.model");
const OrgUser = require("../models/org_user.model");
const bcryptjs = require("bcryptjs");
const { UserDuplicate } = require("../errors/user.error");
const logger = require("../logger");
exports.createOrg = requestAsyncHandler(async (req, res) => {
  const body = await createOrgDto.validateAsync(req.body);
  const organization = new Org(body);
  const newOrg = await organization.save();
  const orgUser = new OrgUser({
    org: newOrg.id,
    user: req.session.user._id,
    role: "admin",
  });
  await orgUser.save();
  logger.info(`Organization created with id ${newOrg.id}`);
  return res.status(200).json({ message: "Organization registered" });
});

exports.getOrg = requestAsyncHandler(async (req, res) => {
  const userId = req.session.user._id;
  const org = await Org.findByIdAndUserId(userId, req.params.orgId);
  if (!org) throw new OrgNotFound();
  return res.status(200).json({ data: org });
});

exports.createNewUserForOrg = requestAsyncHandler(async (req, res) => {
  const body = await registerUserDto.validateAsync(req.body);
  const { email, password, name } = body;
  const existingUser = await User.findByEmailId(email);
  if (existingUser) throw new UserDuplicate();
  const hashedPassword = await bcryptjs.hash(
    password,
    await bcryptjs.genSalt(10)
  );
  const registeredUser = await User.create({
    email,
    password: hashedPassword,
    name,
  });
  const orgUser = new OrgUser({
    org: req.session.org,
    user: registeredUser.id,
    role: "user",
  });
  await orgUser.save();
  logger.info(`Organization user created with id ${orgUser.id}`);
  return res
    .status(201)
    .json({ message: "User registered successfully for organization" });
});

exports.getOrgsOfUser = requestAsyncHandler(async (req, res) => {
  const organizations = await OrgUser.find({
    user: req.session.user._id,
  })
    .populate("org")
    .select("org role");
  return res.status(200).json({ data: organizations });
});
