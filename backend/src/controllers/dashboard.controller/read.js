const { isValidObjectId } = require("mongoose");
const Invoice = require("../../models/invoice.model");
const Quotes = require("../../models/quotes.model");
const { OrgNotFound } = require("../../errors/org.error");
const Party = require("../../models/party.model");
const Expense = require("../../models/expense.model");
const Purchase = require("../../models/purchase.model");
const read = async (req, res) => {
  const { startDate, endDate } = req.query;
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const countEntitiesPromises = [Invoice, Quotes, Expense, Purchase];
  const [invCount, quoCount, expCount, purCount, partiesCount] = await Promise.all(
    countEntitiesPromises.map((model) =>
      model.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        org: orgId,
      })
    )
  );
 
  const counts = {
    invoices: invCount,
    quotes: quoCount,
    expenses: expCount,
    purchases: purCount,
    parties: partiesCount,
  };
  const recentEntities = [Invoice, Quotes, Purchase];
  const [invoices, quotes, purchases] = await Promise.all(
    recentEntities.map((model) =>
      model
        .find({ org: orgId })
        .sort({ createdAt: -1 })
        .select("name num total totalTax status party date num")
        .populate("party", "name")
        .limit(5)
        .exec()
    )
  );
  return res.status(200).json({
    data: {
      counts,
      tables: {
        invoices,
        quotes,
        purchases,
      },
    },
  });
};

module.exports = read;
