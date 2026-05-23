const { z } = require("zod");
const { getProvider } = require("../../ai/providers");
const Setting = require("../../models/settings.model");
const { encrypt } = require("../../services/hashing.service");
const { invalidateSettingCache } = require("../../services/setting.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const addProvider = async (req, res, providerField, getFieldsToSave, schema, validateFn) => {
    const value = await schema.parseAsync(req.body);
    const org = req.params.orgId;
    const { name, provider, fields } = value;

    if (validateFn) validateFn(provider, fields);

    const fieldsToSave = getFieldsToSave(fields);

    const currentSetting = await Setting.findOne({ org });
    const isActive = !currentSetting[providerField] || currentSetting[providerField].length === 0;

    const result = await Setting.updateOne({ org }, {
        $push: {
            [providerField]: {
                name,
                provider,
                fields: fieldsToSave,
                isActive
            }
        }
    });

    if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Organization settings not found" });
    }

    invalidateSettingCache(org);

    return res.status(201).json({
        success: true,
        message: `${providerField === 'aiProviders' ? 'AI' : 'SMTP'} Provider added successfully`
    });
};

const deleteProvider = async (req, res, providerField) => {
    const { providerId } = req.params;
    const org = req.params.orgId;

    await executeMongoDbTransaction(async (session) => {
        const setting = await Setting.findOne({ org }).session(session);
        if (!setting) {
            const error = new Error("Organization settings not found");
            error.statusCode = 404;
            throw error;
        }

        const providerToRemove = setting[providerField].find(p => p._id.toString() === providerId);
        const wasActive = providerToRemove?.isActive;

        await Setting.updateOne({ org }, {
            $pull: {
                [providerField]: { _id: providerId }
            }
        }, { session });

        if (wasActive) {
            const updatedSetting = await Setting.findOne({ org }).session(session);
            if (updatedSetting[providerField] && updatedSetting[providerField].length > 0) {
                await Setting.updateOne(
                    { org, [`${providerField}.0`]: { $exists: true } },
                    { $set: { [`${providerField}.0.isActive`]: true } },
                    { session }
                );
            }
        }
    });

    invalidateSettingCache(org);

    return res.status(200).json({
        success: true,
        message: `${providerField === 'aiProviders' ? 'AI' : 'SMTP'} Provider removed successfully`
    });
};

const activateProvider = async (req, res, providerField) => {
    const { providerId } = req.params;
    const org = req.params.orgId;

    await executeMongoDbTransaction(async (session) => {
        await Setting.updateOne(
            { org },
            { $set: { [`${providerField}.$[].isActive`]: false } },
            { session }
        );

        const result = await Setting.updateOne(
            { org, [`${providerField}._id`]: providerId },
            { $set: { [`${providerField}.$.isActive`]: true } },
            { session }
        );

        if (result.matchedCount === 0) {
            const error = new Error("Provider not found");
            error.statusCode = 404;
            throw error;
        }
    });

    await invalidateSettingCache(org);

    return res.status(200).json({
        success: true,
        message: `${providerField === 'aiProviders' ? 'AI' : 'SMTP'} Provider activated successfully`
    });
};

const aiSchema = z.object({
    name: z.string(),
    provider: z.enum(["grok", "ollama"]),
    fields: z.object({
        apiKey: z.string(),
    }),
});

const create = (req, res) => addProvider(
    req, res, 'aiProviders',
    (fields) => ({ apiKey: encrypt(fields.apiKey) }),
    aiSchema,
    (provider, fields) => getProvider(provider, { apiKey: fields.apiKey })
);

const remove = (req, res) => deleteProvider(req, res, 'aiProviders');
const setActive = (req, res) => activateProvider(req, res, 'aiProviders');

const smtpSchema = z.object({
    name: z.string(),
    provider: z.enum(["gmail", "brevo"]),
    fields: z.object({
        user: z.string(),
        pass: z.string(),
        port: z.number(),
        secure: z.boolean(),
    }),
});

const createSmtp = (req, res) => addProvider(
    req, res, 'smtpProviders',
    (fields) => ({ ...fields, pass: encrypt(fields.pass) }),
    smtpSchema
);

const removeSmtp = (req, res) => deleteProvider(req, res, 'smtpProviders');
const setActiveSmtp = (req, res) => activateProvider(req, res, 'smtpProviders');

module.exports = { create, remove, setActive, createSmtp, removeSmtp, setActiveSmtp };