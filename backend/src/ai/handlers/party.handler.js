const { PartyNotFound } = require("../../errors/party.error");
const partyService = require("../../services/party.service");
const getDateFilterFromDuration = (duration) => {
  const now = new Date();
  let startDate = new Date();

  switch (duration) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "60d":
      startDate.setDate(now.getDate() - 60);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1w":
      startDate.setDate(now.getDate() - 7);
      break;
    case "2w":
      startDate.setDate(now.getDate() - 14);
      break;
    case "1m":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(now.getMonth() - 3);
      break;
    default:
      return null;
  }

  return {
    $gte: startDate,
    $lte: now
  };
};
const partyHandler = {
    create_party: (params) => {
        return partyService.create(params);
    },
    get_party: async (params) => {
        try {
            const party = await partyService.findOne(params);
            return party;
        } catch (error) {
            return {
                error: true,
                message: "Error fetching party details. Please ensure the party name or ID is correct and try again."
            }
        }

    }
}
module.exports = partyHandler;