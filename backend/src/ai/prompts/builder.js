const createPromptBuilder = () => {
  const state = {
    system: null,
    instructions: [],
    context: [],
    history: [],
    user: null,
    tools: [],
  };

  return {
    system(text) {
      state.system = text;
      return this;
    },

    instructions(text) {
      state.instructions.push(text);
      return this;
    },

    context(data) {
      if (data) state.context.push(data);
      return this;
    },

    history(messages = []) {
      state.history.push(...messages);
      return this;
    },

    user(text) {
      state.user = text;
      return this;
    },

    tools(tools = []) {
      state.tools = tools;
      return this;
    },

    build() {
      const sections = [];

      if (state.system) {
        sections.push(`SYSTEM:\n${state.system}`);
      }

      if (state.instructions.length) {
        sections.push(`INSTRUCTIONS:\n${state.instructions.join("\n")}`);
      }

      if (state.context.length) {
        sections.push(
          `CONTEXT:\n${state.context
            .map((c) => JSON.stringify(c, null, 2))
            .join("\n")}`
        );
      }

      if (state.history.length) {
        sections.push(
          `HISTORY:\n${state.history
            .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n")}`
        );
      }

      if (state.tools.length) {
        sections.push(
          `TOOLS:\n${JSON.stringify(state.tools, null, 2)}`
        );
      }

      if (state.user) {
        sections.push(`USER:\n${state.user}`);
      }

      return sections.join("\n\n");
    },

    buildMessages() {
      const messages = [];

      if (state.system) {
        messages.push({ role: "system", content: state.system });
      }

      state.history.forEach((m) => messages.push(m));

      if (state.user) {
        messages.push({ role: "user", content: state.user });
      }

      return messages;
    },
  };
};

module.exports = createPromptBuilder;