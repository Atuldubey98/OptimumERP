const { generateText, tool, jsonSchema } = require("ai");
const getHandler = require("./handlers");
const rawTools = require("./tools");
const logger = require("../logger");
const { cleanPayloadForAi } = require("../utils");
const { getProvider } = require("./providers");

const toolDisplayMap = {
  download_report: "Generating report link...",
  download_bill: "Preparing document download...",
  find_bills: "Searching documents...",
  create_bill: "Generating billing document...",
  get_parties: "Fetching customer details...",
  create_party: "Creating customer record...",
  get_party_ledger: "Loading account ledger...",
  get_product_details: "Searching products...",
  create_product: "Creating item...",
  create_contact: "Creating contact...",
  get_contacts: "Retrieving contact details...",
  send_email: "Sending email...",
  create_payment_voucher: "Creating payment voucher...",
  find_payment_voucher: "Fetching payment voucher...",
  list_expenses: "Listing expenses...",
  create_expense: "Creating expense...",
  list_expense_categories: "Listing expense categories...",
  create_expense_category: "Creating expense category...",
  get_activity_log: "Fetching history...",
  get_business_stats: "Fetching business performance data...",
  list_document_vouchers: "Fetching list of vouchers...",
  forecast_sales: "Predicting business...",
};

const convertToSdkMessages = (messages) => {
  const toolCallIdToName = {};
  for (const msg of messages) {
    if ((msg.role === "assistant" || msg.role === "ai") && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        if (tc.id) toolCallIdToName[tc.id] = tc.function?.name || "unknown";
      }
    }
  }

  return messages
    .map((msg) => {
      if (msg.role === "system") {
        return { role: "system", content: msg.content || "" };
      }

      if (msg.role === "user") {
        if (msg.images?.length > 0) {
          return {
            role: "user",
            content: [
              { type: "text", text: msg.content || "" },
              ...msg.images.map((img) => ({ type: "image", image: img })),
            ],
          };
        }
        return { role: "user", content: msg.content || "" };
      }

      if (msg.role === "assistant" || msg.role === "ai") {
        if (!msg.tool_calls?.length) {
          return { role: "assistant", content: msg.content || "" };
        }
        const content = [];
        if (msg.content) content.push({ type: "text", text: msg.content });
        for (const tc of msg.tool_calls) {
          const args =
            typeof tc.function?.arguments === "string"
              ? JSON.parse(tc.function.arguments)
              : tc.function?.arguments || {};
          content.push({
            type: "tool-call",
            toolCallId: tc.id,
            toolName: tc.function?.name,
            args,
          });
        }
        return { role: "assistant", content };
      }

      if (msg.role === "tool") {
        const toolName = toolCallIdToName[msg.tool_call_id] || "unknown";
        let result;
        try {
          result = JSON.parse(msg.content);
        } catch {
          result = { content: msg.content };
        }
        return {
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: msg.tool_call_id,
              toolName,
              result,
            },
          ],
        };
      }

      return null;
    })
    .filter(Boolean);
};

const buildSdkTools = (body, onProgress) => {
  const record = {};

  for (const t of rawTools) {
    const name = t.function.name;
    const handler = getHandler(name);

    record[name] = tool({
      description: t.function.description,
      parameters: jsonSchema(t.function.parameters),
      execute: async (args) => {
        if (onProgress) {
          onProgress({ type: "status", message: toolDisplayMap[name] || name });
        }

        if (!handler) {
          return { success: false, message: `Action '${name}' is not supported.` };
        }

        try {
          const result = await handler({
            ...args,
            org: body?.org,
            createdBy: body?.createdBy,
            user: body?.user,
          });

          return {
            success: true,
            data: cleanPayloadForAi(result) ?? {},
            _downloads: result?.downloads || [],
          };
        } catch (error) {
          logger.error(`Tool Execution Error [${name}]: ${error.message}`);
          return { success: false, message: error.message };
        }
      },
    });
  }

  return record;
};

const aiFactory = ({ provider, apiKey }) => {
  const hosts = {
    ollama: process.env.OLLAMA_HOST,
    grok: process.env.GROK_HOST,
  };
  const host = hosts[provider];

  const { client: aiProvider, processImage } = getProvider(provider, { apiKey, host });

  const stream = async (model, { messages = [], body, onProgress, onChunk, abortSignal }) => {
    try {
      const allDownloads = new Map();
      const newMessages = [];

      const sdkTools = buildSdkTools(body, onProgress);
      const sdkMessages = convertToSdkMessages(messages);

      logger.info("Sending request to AI Provider");
      if (onProgress) onProgress({ type: "status", message: "Thinking..." });

      const { text: finalText } = await generateText({
        model: aiProvider(model),
        messages: sdkMessages,
        tools: sdkTools,
        maxSteps: 10,
        abortSignal,
        temperature: 0,
        onStepFinish: ({ toolCalls, toolResults }) => {
          if (!toolCalls?.length) return;

          newMessages.push({
            role: "assistant",
            content: "",
            tool_calls: toolCalls.map((tc) => ({
              id: tc.toolCallId,
              type: "function",
              function: {
                name: tc.toolName,
                arguments: JSON.stringify(tc.args),
              },
            })),
          });

          for (const tr of toolResults || []) {
            const resultStr =
              typeof tr.result === "string" ? tr.result : JSON.stringify(tr.result);

            newMessages.push({
              role: "tool",
              content: resultStr,
              tool_call_id: tr.toolCallId,
            });

            if (tr.result?._downloads?.length) {
              tr.result._downloads.forEach((d) => {
                if (d.url) allDownloads.set(d.url, d);
              });
            }
          }
        },
      });

      if (finalText) {
        newMessages.push({ role: "assistant", content: finalText });
      }

      const downloads = Array.from(allDownloads.values());
      logger.info("AI response complete");

      return { text: finalText, downloads, newMessages };
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.log(error);

      if (error.name === "AbortError" || error.message === "AbortError" || abortSignal?.aborted) {
        logger.info("Chat generation was aborted by the user.");
        return { text: "", downloads: [], newMessages: [], aborted: true };
      }

      logger.error(`Critical Chat Flow Error: ${error.message}`);
      const errorMsg = { role: "assistant", content: "Critical error encountered. Please try again." };
      return { text: errorMsg.content, downloads: [], newMessages: [errorMsg] };
    }
  };

  return Object.freeze({ stream, processImage });
};

aiFactory.getAIInstanceForProvider = async (orgId, providerId) => {
  const settingService = require("../services/setting.service");
  const { decrypt } = require("../services/hashing.service");

  const settings = await settingService.getDetailedSettingForOrg(orgId);
  const provider = settings?.aiProviders?.find(
    (p) => p._id.toString() === providerId && p.isActive
  );

  if (!provider) return { ai: null, settings };

  const apiKey = decrypt(provider.fields.apiKey);
  logger.info(`Initializing provider: ${provider.provider} (${providerId})`);

  return {
    ai: aiFactory({ provider: provider.provider, apiKey }),
    settings,
    providerType: provider.provider,
    defaultModel: provider.fields.defaultModel,
  };
};

module.exports = aiFactory;
