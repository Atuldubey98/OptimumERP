require("dotenv").config({
  path:
    process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});

const propertyService = require("./services/property.service");
const Property = require("./models/properties.model");
const fs = require("fs/promises");
const dbService = require("./services/db.service");
const seeder = async () => {
  try {
    await dbService.connectDatabase(process.env.MONGO_URI);
    console.log("Connected to database for seeding");
    let property;
    try {
      property = await propertyService.getByName("SEEDED_DB");
    } catch (error) {
      console.log("Property not found creating");
    }
    if (property) {
      console.log("Database already seeded. Exiting seeder.");
      await dbService.closeDBConnection();
      process.exit(0);
    }
    const defaultProperties = await fs.readFile("./properties.json", "utf-8");
    const properties = JSON.parse(defaultProperties);
    for (const prop of properties) {
      await Property.updateOne(
        { name: prop.name },
        {
          $setOnInsert: prop,
        },
        { upsert: true }
      )
        .lean()
        .exec();
    }
    await Property.updateOne(
      { name: "SEEDED_DB" },
      {
        name: "SEEDED_DB",
        value: true,
      },
      { upsert: true }
    );
    console.log("Database seeding completed successfully.");
    await dbService.closeDBConnection();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seeder();
