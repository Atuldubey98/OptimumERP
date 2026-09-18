const aiFactory = require("../../ai");
const factory = require("../../ai/prompts/factory");
const { AiProviderNotFound } = require("../../errors/chat.error");
const Joi = require("joi");
const logger = require("../../logger");

const icebreakers = async (req, res) => {
  const orgId = req.params.orgId;

  const body = await Joi.object({
    message: Joi.string().required(),
    userPrompt: Joi.string().allow("").optional(),
    providerId: Joi.string().optional(),
    model: Joi.string().optional(),
  }).validateAsync(req.body);

  const { ai, defaultModel, settings } = await aiFactory.getAIInstanceForProvider(orgId, body.providerId);

  if (!ai) {
    throw new AiProviderNotFound();
  }

  const iceBreakers = settings?.assistant?.iceBreakers;

  if (!iceBreakers?.enabled || !iceBreakers?.autogenerate) {
    return res.status(200).json({
      success: true,
      data: {
        prompts: [],
      },
    });
  }

  try {
    const capabilities = aiFactory.getToolCapabilities ? aiFactory.getToolCapabilities() : [];
    const systemPrompt = factory.iceBreakersPrompt({ capabilities }).build();
    const userPrompt = factory.iceBreakersUserPrompt({
      assistantMessage: body.message,
      userMessage: body.userPrompt,
    }).build();

    const { text } = await ai.stream(body.model || defaultModel, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: false,
      maxTokens: 100,
      body: { org: orgId, createdBy: req.session?.user?._id },
    });

    let prompts = [];
    if (text) {
      const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = clean.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            prompts = parsed.slice(0, 3).map((p) => String(p).trim()).filter(Boolean);
          }
        } catch (err) {
          logger.warn(`Failed to parse icebreakers JSON: ${err.message}`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        prompts,
      },
    });
  } catch (err) {
    logger.error(`Error generating icebreakers: ${err.message}`);
    return res.status(200).json({
      success: true,
      data: {
        prompts: [],
      },
    });
  }
};

module.exports = icebreakers;
