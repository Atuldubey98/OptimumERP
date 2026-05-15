const { Router } = require("express");
const { checkPlan } = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const {
    create,
    update,
    remove,
    read,
    paginate,
} = require("../controllers/recurringInvoice.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const recurringInvoiceRouter = Router({
    mergeParams: true,
});

recurringInvoiceRouter.use(checkPlan(["platinum"]));

recurringInvoiceRouter.post("/", createModel, requestAsyncHandler(create));
recurringInvoiceRouter.get("/", requestAsyncHandler(paginate));
recurringInvoiceRouter.get("/:recurringInvoiceId", requestAsyncHandler(read));
recurringInvoiceRouter.patch("/:recurringInvoiceId", updateModel, requestAsyncHandler(update));
recurringInvoiceRouter.delete("/:recurringInvoiceId", requestAsyncHandler(remove));

module.exports = recurringInvoiceRouter;
