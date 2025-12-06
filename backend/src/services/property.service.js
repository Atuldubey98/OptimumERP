const { PropertyNotFound } = require("../errors/property.error");
const Property = require("../models/properties.model");
const fs = require("fs/promises");
exports.getByName = async (name) => {
  if (!name) throw new PropertyNotFound();
  const property = await Property.findOne({ name }).lean().exec();
  if (!property) throw new PropertyNotFound();
  return property;
};

exports.getCurrencyConfig = async (filter = {}) => {
  const property = await Property.findOne({
    name: "CURRENCIES_CONFIG",
    ...filter,
  }).lean();
  return property;
};

exports.getTemplateConfig = async (filter = {}) => {
  const property = await Property.findOne({
    name: "TEMPLATES_CONFIG",
    ...filter,
  }).lean();
  return property;
};

exports.getPropertiesCount = async () => {
  const count = await Property.countDocuments();
  return count;
};

exports.createProperties = async () => {
  const data = await fs.readFile("../../../conf/erp.properties.json", "utf-8");
  const properties = JSON.parse(data);
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
};
