const aiFactory = require("../../ai");
const settingService = require("../../services/setting.service");
const factory = require("../../ai/prompts/factory");
const requestAsyncHandler = require("../../handlers/requestAsync.handler");
const { AiProviderNotFound, AiEngineInitializationFailed } = require("../../errors/chat.error");
const Joi = require("joi");

const generate = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;

  const body = await Joi.object({
    prompt: Joi.string().required(),
    context: Joi.string().allow("").optional()
  }).validateAsync(req.body);

  const settings = await settingService.getDetailedSettingForOrg(orgId);
  const activeProvider = settings?.aiProviders?.find((p) => p.isDefault) || settings?.aiProviders?.find((p) => p.isActive);

  if (!activeProvider) {
    throw new AiProviderNotFound();
  }

  const { ai, defaultModel } = await aiFactory.getAIInstanceForProvider(
    orgId,
    activeProvider._id.toString()
  );

  if (!ai) {
    throw new AiEngineInitializationFailed();
  }

  const systemPrompt = factory.generationPrompt({
    organization: settings.org,
    businessContext: body.context
  }).build();

  const { response } = await ai.chat(defaultModel, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: body.prompt }
    ],
    options: { tools: [] }
  });

  return res.status(200).json({
    success: true,
    data: {
      result: response.content
    }
  });
});

module.exports = generate;