const { Ollama } = require("ollama");
const getHandler = require("./handlers");
const tools = require("./tools");
const logger = require("../logger");

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

const executeTools = async ({ toolCalls, body, onProgress }) => {
  logger.info(
    `Processing ${toolCalls.length} tool(s): ${toolCalls.map((t) => t.function.name).join(", ")}`,
  );
  const toolDisplayMap = {
    find_bill: "Retrieving document details...",
    create_bill: "Generating billing document...",
    get_party: "Fetching customer details...",
    get_parties: "Searching customers...",
    create_party: "Creating customer record...",
    get_party_ledger: "Loading account ledger...",
  };
  const toolPromises = toolCalls.map(async (tool) => {
    const toolName = tool.function.name;
    const args = tool.function.arguments;
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
        org: body.org,
        createdBy: body.createdBy,
      });
      logger.info("Results from handler ", result);
      return {
        role: "tool",
        content: JSON.stringify({ success: true, data: result }),
        tool_call_id: tool.id,
      };
    } catch (error) {
      logger.error(`Tool Execution Error [${toolName}]: ${error.message}`);
      throw error;
    }
  });

  return await Promise.all(toolPromises);
};

const chat = async (model, { messages = [], body, onProgress }) => {
  try {
    while (true) {
      if (onProgress) {
        onProgress({ type: "status", message: "Thinking..." });
      }

      const response = await ollama.chat({
        model,
        messages,
        tools,
        options: { temperature: 0 },
      });

      const aiMessage = response.message;
      messages.push(aiMessage);

      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        const toolResults = await executeTools({
          toolCalls: aiMessage.tool_calls,
          body,
          onProgress,
        });

        messages.push(...toolResults);

        const hasError = toolResults.some(
          (res) => !JSON.parse(res.content).success,
        );

        if (hasError) {
          messages.push({
            role: "system",
            content:
              "A tool error occurred. Please explain the issue to the user politely based on the error message provided in the tool results. Suggest how they can adjust their prompt to fix it.",
          });

          if (onProgress) {
            onProgress({ type: "status", message: "Resolving error..." });
          }

          const finalAiExplanation = await ollama.chat({
            model,
            messages,
            options: { temperature: 0.3 },
          });

          return finalAiExplanation.message;
        }

        continue;
      }

      return aiMessage;
    }
  } catch (error) {
    logger.error(`Critical Chat Flow Error: ${error.message}`);

    try {
      const errorSummary = await ollama.chat({
        model,
        messages: [
          ...messages,
          {
            role: "system",
            content: `A system error occurred: ${error.message}. Provide a human-readable apology.`,
          },
        ],
        options: { temperature: 0.3 },
      });
      return errorSummary.message;
    } catch (innerError) {
      return {
        role: "assistant",
        content:
          "I encountered a critical error while processing your request. Please try again later.",
      };
    }
  }
};

module.exports = { chat };
