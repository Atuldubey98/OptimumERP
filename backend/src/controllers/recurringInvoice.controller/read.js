const { RecurringInvoiceNotFound } = require("../../errors/recurringInvoice.error");
const recurringInvoiceService = require("../../services/recurringInvoice.service");

const read = async (req, res) => {
    const filter = {
        _id: req.params.recurringInvoiceId,
        org: req.params.orgId,
    };

    const recurringInvoice = await recurringInvoiceService.findOne(filter);

    if (!recurringInvoice) throw new RecurringInvoiceNotFound();

    return res.status(200).json({
        data: recurringInvoice,
    });
};

module.exports = read;
