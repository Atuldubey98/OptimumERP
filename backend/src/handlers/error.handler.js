const logger = require("../logger");
module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let code = err.code || 500;
  let message;
  if (err.name === "ValidationError") {
    code = 422;
    message = err.message;
  } else if (err.name === "MongoServerError") {
    code = 400;
    const mongoKeyMap = {
      11000: "MongoServerError_11000",
      121: "MongoServerError_121",
      172: "MongoServerError_172",
    };
    const i18nKey = mongoKeyMap[err.code] || "MongoServerError_default";
    message = req.t(`errors.${i18nKey}`);
  } else if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    code = 401;
    message = req.t(`errors.${err.name}`);
  } else {
    message = req.t(`errors.${err.name || "InternalError"}`, err.params || {});
  }
  const name = err.name || "InternalError";
  logger.error(`${name}: ${message}`);
  return res.status(code > 500 ? 500 : code).json({
    status: false,
    message,
    url: req.originalUrl,
    method: req.method,
    name,
  });
};
