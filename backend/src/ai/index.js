  const { Ollama } = require("ollama");
  const getHandler = require("./handlers");
  const tools = require("./tools");
  const logger = require("../logger");

  const ollama = new Ollama({
      host: "https://ollama.com",
      headers: {
          Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`
      }
  });

  const chat = async (model, { messages = [], body }) => {
      const MAX_ITERATIONS = 5;
      let iteration = 0;

      while (iteration < MAX_ITERATIONS) {
          iteration++;

          const response = await ollama.chat({
              model,
              messages,
              tools
          });

          const aiMessage = response.message;
          messages.push(aiMessage);

          if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
              return aiMessage;
          }
          logger.debug(`AI requested tool calls: ${aiMessage.tool_calls.map(tc => tc.function.name).join(", ")}`);
          for (const tool of aiMessage.tool_calls) {
              const handler = getHandler(tool.function.name);
              if (!handler) continue;

              try {
                  const result = await handler({
                      ...tool.function.arguments,
                      org: body.org,
                      createdBy: body.createdBy
                  });

                  messages.push({ 
                      role: "tool",
                      content: JSON.stringify(result),
                      tool_call_id: tool.id
                  });
              } catch (error) {
                  messages.push({
                      role: "tool",
                      content: JSON.stringify({ error: true, message: error.message }),
                  });
              }
          }
      }

      return {
          role: "assistant",
          content: "Execution limit reached."
      };
  };

  module.exports = { chat };