const { ToWords } = require("to-words");

const currencyToWordConverter = (localeCode = "en-IN", amount = 0) => {
  const toWords = new ToWords({
    localeCode,
    converterOptions: {
      currency: true,
    },
  });
  return toWords.convert(amount);
};

module.exports = { currencyToWordConverter };
