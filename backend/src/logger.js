const winston = require("winston");
const config = require("./config");

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: config.LOG_FILE_PATH ? [
    new winston.transports.File({ filename: config.LOG_FILE_PATH }),
  ] : [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
  ],
});

module.exports = logger;