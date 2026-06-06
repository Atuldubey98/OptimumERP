const Joi = require("joi");
const Template = require("../../models/template.model");
const OrgModel = require("../../models/org.model");
const { executeMongoDbTransaction, hasUserReachedCreationLimits } = require("../../services/crud.service");
const { TemplateNotFound, DefaultTemplateCannotBeDeleted } = require("../../errors/template.error");
const { getTemplateListForOrg, invalidateTemplateCache } = require("../../services/template.service");

const create = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid("term", "email").required(),
    content: Joi.string().required(),
  });

  const value = await schema.validateAsync(req.body);
  const org = req.params.orgId;
  const createdBy = req.session.user._id;

  const template = await executeMongoDbTransaction(async (session) => {
    const newTemplate = new Template({
      ...value,
      org,
      createdBy,
    });
    await newTemplate.save({ session });
    await OrgModel.updateOne(
      { _id: org },
      { $inc: { "relatedDocsCount.templates": 1 } },
      { session }
    );
    return newTemplate;
  });

  invalidateTemplateCache(org);

  return res.status(201).json({
    success: true,
    data: template,
    message: "Template created successfully",
  });
};

const update = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().valid("term", "email").optional(),
    content: Joi.string().optional(),
  });

  const value = await schema.validateAsync(req.body);
  const { id } = req.params;
  const org = req.params.orgId;
  const updatedBy = req.session.user._id;

  const template = await Template.findOneAndUpdate(
    { _id: id, org },
    { ...value, updatedBy },
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new TemplateNotFound();
  }

  invalidateTemplateCache(org);

  return res.status(200).json({
    success: true,
    data: template,
    message: "Template updated successfully",
  });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const org = req.params.orgId;

  const template = await Template.findOne({ _id: id, org });
  if (!template) {
    throw new TemplateNotFound();
  }
  if (template.isDefault) {
    throw new DefaultTemplateCannotBeDeleted();
  }

  await executeMongoDbTransaction(async (session) => {
    await Template.softDelete({ _id: id, org }).session(session);
    await OrgModel.updateOne(
      { _id: org },
      { $inc: { "relatedDocsCount.templates": -1 } },
      { session }
    );
  });

  invalidateTemplateCache(org);

  return res.status(200).json({
    success: true,
    message: "Template removed successfully",
  });
};

const setDefault = async (req, res) => {
  const schema = Joi.object({
    type: Joi.string().valid("term", "email").required(),
    id: Joi.string().required(),
  });

  const { type, id } = await schema.validateAsync(req.body);
  const org = req.params.orgId;

  const template = await Template.findOne({ _id: id, org, type });
  if (!template) {
    throw new TemplateNotFound();
  }

  await executeMongoDbTransaction(async (session) => {
    await Template.updateMany(
      { org, type, isDefault: true },
      { $set: { isDefault: false } },
      { session }
    );
    await Template.updateOne(
      { _id: id, org },
      { $set: { isDefault: true } },
      { session }
    );
  });

  invalidateTemplateCache(org);

  return res.status(200).json({
    success: true,
    message: "Default template set successfully",
  });
};

const list = async (req, res) => {
  const org = req.params.orgId;
  const { type } = req.query;
  const templates = await getTemplateListForOrg(org, type);
  const organization = res.locals.organization;
  const hasUserReachedLimit = hasUserReachedCreationLimits({
    relatedDocsCount: organization?.relatedDocsCount || {},
    userLimits: req.session?.user?.limits || {},
    key: "templates",
  });

  return res.status(200).json({
    success: true,
    data: templates,
    hasUserReachedLimit,
  });
};

module.exports = {
  create,
  update,
  remove,
  list,
  setDefault,
};
