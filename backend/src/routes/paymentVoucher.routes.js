const { Router } = require("express");
const { paginate, create, update, remove } = require("../controllers/paymentVoucher.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { limitFreePlanOnCreateEntityForOrganization } = require("../middlewares/auth.middleware");

const paymentVoucherRouter = Router({ mergeParams: true });

paymentVoucherRouter.get("/", requestAsyncHandler(paginate));
paymentVoucherRouter.post(
  "/",
  limitFreePlanOnCreateEntityForOrganization("paymentVouchers"),
  requestAsyncHandler(create)
);
paymentVoucherRouter.patch("/:id", requestAsyncHandler(update));
paymentVoucherRouter.delete("/:id", requestAsyncHandler(remove));

module.exports = paymentVoucherRouter;
