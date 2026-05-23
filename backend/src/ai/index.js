const getHandler = require("./handlers");
const tools = require("./tools");
const logger = require("../logger");
const { getProvider } = require("./providers");

const executeTools = async ({ toolCalls, body, onProgress }) => {
  logger.info(
    `Processing ${toolCalls.length} tool(s): ${toolCalls.map((t) => `${t.function.name} - ${JSON.stringify(t.function.arguments)}`).join(", ")} `,
  );
  const toolDisplayMap = {
    download_report: "Generating report link...",
    download_bill: "Preparing document download...",
    find_bills: "Searching documents...",
    find_bill: "Retrieving document details...",
    create_bill: "Generating billing document...",
    get_party: "Fetching customer details...",
    get_parties: "Searching customers...",
    create_party: "Creating customer record...",
    get_party_ledger: "Loading account ledger...",
    get_product_details: "Searching products...",
    create_product: "Creating item...",
    create_contact: "Creating contact...",
    get_contacts: "Getting the contact details...",
    get_contact: "Retrieving contact details...",
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
  };

  const toolPromises = toolCalls.map(async (tool) => {
    const toolName = tool.function.name;
    const args = typeof tool.function.arguments === "string"
      ? JSON.parse(tool.function.arguments)
      : tool.function.arguments;
    const handler = getHandler(toolName);

    if (onProgress) {
      onProgress({
        type: "status",
        message: toolDisplayMap[toolName] || toolName,
      });
    }

    if (!handler) {
      return {
        role: "tool",
        content: JSON.stringify({
          success: false,
          message: `Action '${toolName}' is not supported.`,
        }),
        tool_call_id: tool.id,
      };
    }

    try {
      const result = await handler({
        ...args,
        org: body?.org,
        createdBy: body?.createdBy,
        user: body?.user,
      });
      return {
        role: "tool",
        content: JSON.stringify({
          success: true,
          data: result,
        }),
        fullData: result,
        tool_call_id: tool.id,
      };
    } catch (error) {
      logger.error(`Tool Execution Error [${toolName}]: ${error.message}`);
      return {
        role: "tool",
        content: JSON.stringify({
          success: false,
          message: error.message,
        }),
        tool_call_id: tool.id,
      };
    }
  });

  return await Promise.all(toolPromises);
};

const aiFactory = ({ provider, apiKey }) => {
  const hosts = {
    ollama: process.env.OLLAMA_HOST,
    grok: process.env.GROK_HOST,
  };
  const host = hosts[provider];
  const aiProvider = getProvider(provider, { apiKey, host });

  const chat = async (model, { messages = [], body, onProgress, options = {}, abortSignal }) => {
    try {
      const allDownloads = new Map();
      let iterations = 0;
      const MAX_ITERATIONS = 10;
      const toolCallHistory = new Set();
      const history = [...messages];
      logger.info("Sending requests to AI Provider");
      while (iterations < MAX_ITERATIONS) {
        if (abortSignal?.aborted) throw new Error("AbortError");

        iterations++;
        if (onProgress) onProgress({ type: "status", message: "Thinking..." });

        const response = await aiProvider.chat({
          model,
          messages: history.map(msg => {
            const mappedRole = msg.role === "ai" ? "assistant" : msg.role;
            const mapped = {
              role: mappedRole,
              content: msg.content || "",
              ...(msg.images && { images: msg.images })
            };
            if (mappedRole === "assistant" && msg.tool_calls && msg.tool_calls.length > 0) {
              mapped.tool_calls = msg.tool_calls;
            }
            if (msg.role === "tool" && msg.tool_call_id) {
              mapped.tool_call_id = msg.tool_call_id;
            }
            return mapped;
          }),
          tools: options.tools !== undefined ? options.tools : tools,
          options: { temperature: 0, ...options, abortSignal }
        });

        logger.info("Received some response from AI Provider")

        const aiMessage = response.message;
        history.push(aiMessage);

        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
          const currentCalls = aiMessage.tool_calls.map(tc =>
            `${tc.function.name}:${typeof tc.function.arguments === 'string' ? tc.function.arguments : JSON.stringify(tc.function.arguments)}`
          );

          if (currentCalls.some(call => toolCallHistory.has(call))) {
            logger.warn("Duplicate tool call loop detected.");
            return { response: aiMessage, newMessages: history.slice(messages.length) };
          }

          currentCalls.forEach(call => toolCallHistory.add(call));

          const toolResults = await executeTools({
            toolCalls: aiMessage.tool_calls,
            body,
            onProgress,
          });

          history.push(...toolResults);

          toolResults.forEach((res) => {
            if (res.fullData?.downloads) {
              res.fullData.downloads.forEach(d => {
                if (d.url) allDownloads.set(d.url, d);
              });
            }
          });

          const hasError = toolResults.some(res => !JSON.parse(res.content).success);
          if (hasError && iterations === MAX_ITERATIONS - 1) {
            history.push({
              role: "system",
              content: "The previous tool call failed. Please explain the error to the user."
            });
          }
          continue;
        }

        if (allDownloads.size > 0) {
          aiMessage.downloads = Array.from(allDownloads.values());
        }

        return {
          response: aiMessage,
          newMessages: history.slice(messages.length)
        };
      }

      const finalResponse = { role: "assistant", content: "Limit reached. Please simplify request." };
      return { response: finalResponse, newMessages: [finalResponse] };

    } catch (error) {
      if (process.env.NODE_ENV === "development") console.log(error)
      if (error.name === "AbortError" || error.message === "AbortError" || abortSignal?.aborted) {
        logger.info("Chat generation was aborted by the user.");
        const errorMessage = { role: "assistant", content: "Generation stopped." };
        return { response: errorMessage, newMessages: [errorMessage] };
      }
      logger.error(`Critical Chat Flow Error: ${error.message}`);
      const errorMessage = { role: "assistant", content: "Critical error encountered. Please try again." };
      return { response: errorMessage, newMessages: [errorMessage] };
    }
  };

  return Object.freeze({
    chat,
    processImage: aiProvider.processImage,
    activeProvider: provider,
  });

};

aiFactory.getAIInstanceForOrg = async (orgId) => {
  const settingService = require("../services/setting.service");
  const { decrypt } = require("../services/hashing.service");

  const settings = await settingService.getDetailedSettingForOrg(orgId);
  const activeProvider = settings?.aiProviders?.find((p) => p.isActive);

  if (!activeProvider) return { ai: null, settings };

  const apiKey = decrypt(activeProvider.fields.apiKey);
  const providerType = activeProvider.provider;
  logger.info(`Active Provider: ${providerType}`);

  return {
    ai: aiFactory({ provider: providerType, apiKey }),
    settings,
    activeProviderId: activeProvider._id.toString(),
    defaultModel: activeProvider.fields.defaultModel
  };
};

module.exports = aiFactory;
