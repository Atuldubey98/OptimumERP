const propertyService = require("./property.service");
const { decrypt } = require("./hashing.service");
const getProviders = () => {
    return propertyService.getByName("SMTP_PROVIDERS");
};
const getProviderConfig = async (provider) => {
    const providers = await getProviders();
    return providers.value.find((p) => p.provider === provider);
}
const getMailerSetup = async (activeProviderSetting) => {
    const provider = await getProviderConfig(activeProviderSetting?.provider);
    const nodemailer = require("nodemailer");
    const mailer = nodemailer.createTransport({
        host: provider?.host,
        secure: activeProviderSetting?.fields?.secure,
        port: activeProviderSetting?.fields?.port,
        auth: {
            user: activeProviderSetting?.fields.user,
            pass: decrypt(activeProviderSetting?.fields.pass),
        },
    });
    return {
        mailer,
        send: async (to, cc, subject, body, attachments, from, inReplyTo, references) => {
            const info = await mailer.sendMail({
                from: from || `"OptimumERP" <${activeProviderSetting?.fields?.user}>`,
                to,
                cc,
                subject,
                html: body,
                attachments,
                inReplyTo,
                references,
            });
            return info;
        }
    }
}
module.exports = {
    getProviderConfig,
    getMailerSetup,
};