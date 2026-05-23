const Joi = require("joi");
const { getProvider } = require("../../ai/providers");
const Setting = require("../../models/settings.model");
const { encrypt } = require("../../services/hashing.service");
const { invalidateSettingCache } = require("../../services/setting.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const create = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        provider: Joi.string().valid("grok", "ollama").required(),
        fields: Joi.object({
            apiKey: Joi.string().required(),
        }).required(),
    });

    const value = await schema.validateAsync(req.body);

    const org = req.params.orgId;
    const { name, provider, fields } = value;

    const aiProvider = getProvider(provider, {
        apiKey: fields.apiKey,
    });

    const encryptedApiKey = encrypt(fields.apiKey);

    const currentSetting = await Setting.findOne({ org });
    const isActive = !currentSetting.aiProviders || currentSetting.aiProviders.length === 0;

    const result = await Setting.updateOne({ org }, {
        $push: {
            aiProviders: {
                name,
                provider,
                fields: {
                    apiKey: encryptedApiKey
                },
                isActive
            }
        }
    });

    if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Organization settings not found" });
    }

    await invalidateSettingCache(org);

    return res.status(201).json({
        success: true,
        message: "AI Provider added successfully"
    });
};

const remove = async (req, res) => {
    const { providerId } = req.params;
    const org = req.params.orgId;

    await executeMongoDbTransaction(async (session) => {
        const setting = await Setting.findOne({ org }).session(session);
        if (!setting) {
            const error = new Error("Organization settings not found");
            error.statusCode = 404;
            throw error;
        }

        const providerToRemove = setting.aiProviders.find(p => p._id.toString() === providerId);
        const wasActive = providerToRemove?.isActive;

        await Setting.updateOne({ org }, {
            $pull: {
                aiProviders: { _id: providerId }
            }
        }, { session });

        if (wasActive) {
            const updatedSetting = await Setting.findOne({ org }).session(session);
            if (updatedSetting.aiProviders.length > 0) {
                await Setting.updateOne(
                    { org, "aiProviders.0": { $exists: true } },
                    { $set: { "aiProviders.0.isActive": true } },
                    { session }
                );
            }
        }
    });

    await invalidateSettingCache(org);

    return res.status(200).json({
        success: true,
        message: "AI Provider removed successfully"
    });
};

const setActive = async (req, res) => {
    const { providerId } = req.params;
    const org = req.params.orgId;

    const setting = await Setting.findOne({ org });
    if (!setting) {
        return res.status(404).json({ success: false, message: "Organization settings not found" });
    }

    const provider = setting.aiProviders.find(p => p._id.toString() === providerId);
    if (!provider) {
        return res.status(404).json({ success: false, message: "Provider not found" });
    }

    const result = await Setting.updateOne(
        { org, "aiProviders._id": providerId },
        { $set: { "aiProviders.$.isActive": !provider.isActive } }
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Provider not found" });
    }

    await invalidateSettingCache(org);

    return res.status(200).json({
        success: true,
        message: provider.isActive ? "AI Provider deactivated" : "AI Provider activated",
        isActive: !provider.isActive,
    });
};


const createSmtp = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        provider: Joi.string().valid("gmail", "brevo").required(),
        fields: Joi.object({
            user: Joi.string().required(),
            pass: Joi.string().required(),
            port: Joi.number().required(),
            secure: Joi.boolean().required(),
        }).required(),
    });

    const value = await schema.validateAsync(req.body);
    const org = req.params.orgId;
    const { name, provider, fields } = value;

    const encryptedPass = encrypt(fields.pass);

    const currentSetting = await Setting.findOne({ org });
    const isActive = !currentSetting.smtpProviders || currentSetting.smtpProviders.length === 0;

    const result = await Setting.updateOne({ org }, {
        $push: {
            smtpProviders: {
                name,
                provider,
                fields: {
                    ...fields,
                    pass: encryptedPass
                },
                isActive
            }
        }
    });

    if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Organization settings not found" });
    }

    await invalidateSettingCache(org);

    return res.status(201).json({
        success: true,
        message: "SMTP Provider added successfully"
    });
};

const removeSmtp = async (req, res) => {
    const { providerId } = req.params;
    const org = req.params.orgId;

    await executeMongoDbTransaction(async (session) => {
        const setting = await Setting.findOne({ org }).session(session);
        if (!setting) {
            const error = new Error("Organization settings not found");
            error.statusCode = 404;
            throw error;
        }

        const providerToRemove = setting.smtpProviders.find(p => p._id.toString() === providerId);
        const wasActive = providerToRemove?.isActive;

        await Setting.updateOne({ org }, {
            $pull: {
                smtpProviders: { _id: providerId }
            }
        }, { session });

        if (wasActive) {
            const updatedSetting = await Setting.findOne({ org }).session(session);
            if (updatedSetting.smtpProviders.length > 0) {
                await Setting.updateOne(
                    { org, "smtpProviders.0": { $exists: true } },
                    { $set: { "smtpProviders.0.isActive": true } },
                    { session }
                );
            }
        }
    });

    await invalidateSettingCache(org);

    return res.status(200).json({
        success: true,
        message: "SMTP Provider removed successfully"
    });
};

const setActiveSmtp = async (req, res) => {
    const { providerId } = req.params;
    const org = req.params.orgId;

    await executeMongoDbTransaction(async (session) => {
        await Setting.updateOne(
            { org },
            { $set: { "smtpProviders.$[].isActive": false } },
            { session }
        );

        const result = await Setting.updateOne(
            { org, "smtpProviders._id": providerId },
            { $set: { "smtpProviders.$.isActive": true } },
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
        message: "SMTP Provider activated successfully"
    });
};

module.exports = { create, remove, setActive, createSmtp, removeSmtp, setActiveSmtp };