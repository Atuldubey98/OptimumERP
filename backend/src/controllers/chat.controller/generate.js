const aiFactory = require("../../ai");
const factory = require("../../ai/prompts/factory");
const { AiProviderNotFound } = require("../../errors/chat.error");
const Joi = require("joi");

const generate = async (req, res) => {
  const orgId = req.params.orgId;

  const body = await Joi.object({
    prompt: Joi.string().required(),
    context: Joi.string().allow("").optional()
  }).validateAsync(req.body);

  const { ai, defaultModel, settings } = await aiFactory.getAIInstanceForProvider(orgId, body.providerId);

  if (!ai) {
    throw new AiProviderNotFound();
  }

  const systemPrompt = factory.generationPrompt({
    organization: settings.org,
    businessContext: body.context
  }).build();

  const { text } = await ai.stream(body.model || defaultModel, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: body.prompt }
    ],
    tools: false,
    body: { org: orgId, createdBy: req.session?.user?._id }
  });

  return res.status(200).json({
    success: true,
    data: {
      result: text
    }
  });
};

module.exports = generate;