const bcryptjs = require("bcryptjs");

exports.getHashedString = async (str) => {
  const SALT = await bcryptjs.genSalt(10);
  const hashedStr = await bcryptjs.hash(str, SALT);
  return hashedStr;
};

exports.compareHashAndActualString = async (str, hashedStr) => {
  return bcryptjs.compare(str, hashedStr);
};
