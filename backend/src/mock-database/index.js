const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017");
const customer = require("./customers");
const organization = require("./organization");
const user = require("./user");
const { createQuotes } = require("./quotes");
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});
(async () => {
  const mockUser = await user.createMockUser();
  const newOrg = await organization.createOrganization(mockUser.id);
  const customers = await customer.createManyCustomers(lorem, newOrg.org, mockUser.id);
  await createQuotes(lorem, customers, mockUser.id, newOrg.org);
  mongoose.disconnect();
})();
