const mongoose = require("mongoose");
const logger = require("../logger");
const connectDatabase = async (MONGO_URI) => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    logger.info("Connected to mongodb");
    return connection;
  } catch (error) {
    logger.error("Some error occured in connecting to mongodb");
    throw error;
  }
};

module.exports = { connectDatabase };
