const mongoose = require("mongoose");
const logger = require("../logger");
const connectDatabase = async (MONGO_URI) => {
  try {
    mongoose.plugin(softDeletePlugin);
    const connection = await mongoose.connect(MONGO_URI);
    logger.info("Connected to mongodb");
    return connection;
  } catch (error) {
    logger.error("Some error occured in connecting to mongodb");
    throw error;
  }
};

const closeDBConnection = async () => {
  try {
    await mongoose.connection.close();
    logger.info("Disconnected from mongodb");
  } catch (error) {
    logger.error("Some error occured in connecting to mongodb");
    throw error;
  }
};

function softDeletePlugin(schema) {
  schema.add({
    deletedAt: {
      type: Date,
    },
  });

  schema.statics.softDeleteById = function (_id) {
    return this.findByIdAndUpdate(_id, {
      $set: { deletedAt: new Date() },
    });
  };

  schema.statics.softDelete = function (filter) {
    return this.findOneAndUpdate(filter, {
      $set: { deletedAt: new Date() },
    });
  };

  function excludeDeleted() {
    this.where({ deletedAt: { $exists: false } });
  }

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
  schema.pre("count", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);
  schema.pre("aggregate", function () {
    this.pipeline().unshift({ $match: { deletedAt: { $exists: false } } });
  });
};

module.exports = { connectDatabase, closeDBConnection };
