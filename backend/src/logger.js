const winston = require("winston");
const config = require("./config");

const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] ${level}: ${message}`;

  // Check if there are extra arguments (splat) or an error object
  const splat = metadata[Symbol.for('splat')];
  if (splat) {
    const additional = splat.map(arg => 
      arg instanceof Error ? arg.stack : JSON.stringify(arg)
    ).join(' ');
    msg += ` ${additional}`;
  }

  return msg;
});

const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(), // This enables the "comma syntax"
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