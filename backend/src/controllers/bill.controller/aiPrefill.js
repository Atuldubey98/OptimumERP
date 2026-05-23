const aiFactory = require("../../ai");
const settingService = require("../../services/setting.service");
const renderEngineService = require("../../services/renderEngine.service.js");
const { decrypt } = require("../../services/hashing.service");
const { z } = require("zod");
const factory = require("../../ai/prompts/factory");

const prefillSchema = z.object({
  model: z.string(),
  attachment: z.object({
    type: z.string(),
    content: z.string(),
  }),
  type: z.string().default("invoices"),
});

const aiPrefill = async (options = {}, req, res) => {
  let value;
  try {
    value = await prefillSchema.parseAsync(req.body);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }
    throw error;
  }

  const { model, attachment, type } = value;
  const { orgId } = req.params;
  const userId = req.session.user._id;

  const settings = await settingService.getDetailedSettingForOrg(orgId);
  const activeProvider = settings?.aiProviders?.find((p) => p.isActive);

  if (!activeProvider) {
    return res.status(400).json({
      message: "Please set up your AI provider keys in organization settings to use the AI features.",
    });
  }

  const apiKey = decrypt(activeProvider.fields.apiKey);
  const ai = aiFactory({ provider: activeProvider.provider, apiKey });

  let images = [];
  if (attachment.type === "application/pdf") {
    images = await renderEngineService.convertPdfToImages(attachment.content);
  } else if (attachment.type.startsWith("image/")) {
    images = [attachment.content];
  } else {
    return res.status(400).json({ message: "Unsupported file type. Please upload an image or PDF." });
  }

  images = images.map((img) => ai.processImage(img));

  const content = factory.prefillPrompt({ type, organization: settings.org }).build();
  const messages = [
    {
      role: "system",
      content,
    },
    {
      role: "user",
      content: "Extract all details from this document and return the data using the tool.",
      images,
    },
  ];

  await ai.chat(model, {
    messages,
    body: {
      org: orgId,
      createdBy: userId,
    },
  });

  const toolResult = messages.find((m) => m.role === "tool" && m.tool_call_id);

  if (toolResult) {
    const parsedContent = JSON.parse(toolResult.content);
    if (parsedContent.success) {
      return res.status(200).json({
        message: "Data extracted successfully",
        data: parsedContent.data,
      });
    } else {
      return res.status(400).json({
        message: parsedContent?.message,
      });
    }
  }

  const lastMessage = messages[messages.length - 1];
  return res.status(400).json({
    message: lastMessage?.content || "Could not extract structured data from the document.",
  });
};

module.exports = aiPrefill;