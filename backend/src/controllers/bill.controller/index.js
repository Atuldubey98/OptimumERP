const create = require("./create");
const paginate = require("./paginate");
const read = require("./read");
const remove = require("./remove");
const update = require("./update");
const htmlView = require("./htmlView");
const download = require("./download");
const exportData = require("./exportData");
const send = require("./send");
const getController = (options) => {
  return {
    read: (req, res) => read(options, req, res),
    create: (req, res) => create(options, req, res),
    htmlView: (req, res) => htmlView(options, req, res),
    paginate: (req, res) => paginate(options, req, res),
    remove: (req, res) => remove(options, req, res),
    update: (req, res) => update(options, req, res),
    download: (req, res) => download(options, req, res),
    exportData: (req, res) => exportData(options, req, res),
    send: (req, res) => send(options, req, res),
  };
};
module.exports = getController;
