const { createRecurringInvoiceDto } = require("../../dto/recurringInvoice.dto");
const { OrgNotFound } = require("../../errors/org.error");
const recurringInvoiceService = require("../../services/recurringInvoice.service");

const create = async (req, res) => {
    const body = await createRecurringInvoiceDto.parseAsync(req.body);
    if (!req.params.orgId) throw new OrgNotFound();
    body.org = req.params.orgId;
    body.createdBy = req.session.user._id;

    const recurringInvoice = await recurringInvoiceService.create(body);

    return res.status(201).json({
        data: recurringInvoice,
        message: req.t("common:api.entity_created", { entity: "Recurring Invoice" }),
    });
};

module.exports = create;
