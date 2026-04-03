const { PropertyNotFound } = require("../errors/property.error");
const Property = require("../models/properties.model");
const fs = require("fs/promises");
const logger = require("../logger");
const cacheService = require("./cache.service");

const PROPERTY_CACHE_SCOPE = "property";

const sortObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(value[key]);
        return acc;
      }, {});
  }

  return value;
};

const makeFilterKey = (filter = {}) => JSON.stringify(sortObject(filter));

const buildPropertyCacheKey = (name, filter = {}) =>
  cacheService.buildKey(PROPERTY_CACHE_SCOPE, name, makeFilterKey(filter));

const getPropertyWithCache = async ({ name, filter = {}, shouldThrow = false }) => {
  const key = buildPropertyCacheKey(name, filter);
  const property = await cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`Property cache miss for ${name}; reading from DB`);
      return Property.findOne({
        name,
        ...filter,
      })
        .lean()
        .exec();
    },
    {
      ttl: cacheService.TTL.veryLong,
      onHit: () => {
        logger.debug(`Property cache hit for ${name}`);
      },
    },
  );

  if (!property && shouldThrow) throw new PropertyNotFound();
  return property;
};

exports.getByName = async (name) => {
  if (!name) throw new PropertyNotFound();
  return getPropertyWithCache({ name, shouldThrow: true });
};

exports.getCurrencyConfig = async (filter = {}) => {
  return getPropertyWithCache({
    name: "CURRENCIES_CONFIG",
    filter,
  });
};

exports.getTemplateConfig = async (filter = {}) => {
  return getPropertyWithCache({
  name: "TEMPLATES_CONFIG",
    filter,
  });
};

exports.getPropertiesCount = async () => {
  const count = await Property.countDocuments();
  return count;
};

exports.invalidatePropertyCache = (name, filter) => {
  if (!name) {
    return cacheService.invalidateScope(PROPERTY_CACHE_SCOPE);
  }

  if (filter !== undefined) {
    return cacheService.del(buildPropertyCacheKey(name, filter));
  }

  return cacheService.invalidateScope(PROPERTY_CACHE_SCOPE, name);
};

exports.warmPropertyCache = async (entries = []) => {
  const defaultEntries = entries.length
    ? entries
    : [
        { name: "CURRENCIES_CONFIG" },
        { name: "TEMPLATES_CONFIG" },
      ];

  return Promise.all(
    defaultEntries.map(({ name, filter = {}, shouldThrow = false }) =>
      getPropertyWithCache({ name, filter, shouldThrow }),
    ),
  );
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
  exports.invalidatePropertyCache();
};
