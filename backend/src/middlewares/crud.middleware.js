const requestAsyncHandler = require("../handlers/requestAsync.handler");

exports.updateModel = requestAsyncHandler(async (req, __, next) => {
  req.body = { ...req.body, updatedBy: req.session.user._id };
  next();
});

exports.createModel = requestAsyncHandler(async (req, __, next) => {
  req.body = { ...req.body, createdBy: req.session.user._id };
  next();
});

exports.paginateModel = requestAsyncHandler(async (req, __, next) => {
  const limit = req.params.limit ? parseInt(req.params.limit) : 10;
  const skip = req.params.skip ? parseInt(req.params.skip) : 0;
  const search = req.params.search || "";
  req.params = { ...req.params, limit, skip, search };
  next();
});
