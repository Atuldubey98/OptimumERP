const { UnAuthenticated } = require("../errors/user.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

module.exports = requestAsyncHandler(async (req, __, next) => {
  if (!req.session.user) next(new UnAuthenticated());
  next();
});
