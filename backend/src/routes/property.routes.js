const { Router } = require("express");

const { read } = require("../controllers/properties.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const propertyRouter = Router({ mergeParams: true });

propertyRouter.get("/:name", requestAsyncHandler(read));

module.exports = propertyRouter;
