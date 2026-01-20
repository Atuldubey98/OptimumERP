require("dotenv").config({
  path:
    process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});
const winston = require("winston");
const propertyService = require("./services/property.service");
const Property = require("./models/properties.model");
const fs = require("fs/promises");
const dbService = require("./services/db.service");
const logger = require("./logger");
const checkIfSeeded = async () => {
  try {
    return await propertyService.getByName("SEEDED_DB");
  } catch (error) {
    logger.info("Property not found creating");
    return null;
  }
};

const loadProperties = async () => {
  const defaultProperties = await fs.readFile("./properties.json", "utf-8");
  return JSON.parse(defaultProperties);
};

const seedProperties = async (properties) => {
  for (const prop of properties) {
    await Property.updateOne(
      { name: prop.name },
      { $setOnInsert: prop },
      { upsert: true }
    )
      .lean()
      .exec();
  }
};

const markSeeded = async () => {
  await Property.updateOne(
    { name: "SEEDED_DB" },
    { name: "SEEDED_DB", value: true },
    { upsert: true }
  );
};

const seeder = async () => {
  try {
    await dbService.connectDatabase(process.env.MONGO_URI);
    
    const property = await checkIfSeeded();
    if (property) {
      logger.info("Database already seeded. Exiting seeder.");
      await dbService.closeDBConnection();
      process.exit(0);
    }
    
    const properties = await loadProperties();
    await seedProperties(properties);
    await markSeeded();
    
    logger.info("Database seeding completed successfully.");
    await dbService.closeDBConnection();
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding database:", error);
  }
};

seeder();
