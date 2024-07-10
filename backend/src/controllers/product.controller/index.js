const create = require("./create");
const read = require("./read");
const bulkCreate = require("./bulkCreate");
const paginate = require("./paginate");
const remove = require("./remove");
const update = require("./update");
module.exports = {
  read,
  create,
  bulkCreate,
  remove,
  paginate,
  update,
};
