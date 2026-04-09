module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  VITE_APP_URL: process.env.VITE_APP_URL,
  VITE_API_URL: process.env.VITE_API_URL,
  IMPORT_CRON_SCHEDULE: process.env.IMPORT_CRON_SCHEDULE,
  LOG_FILE_PATH: process.env.LOG_FILE_PATH,
  NODE_ENV: process.env.NODE_ENV || "development",
};