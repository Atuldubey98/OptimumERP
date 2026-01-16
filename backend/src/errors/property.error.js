class PropertyNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Property does not exists";
    this.name = "PropertyNotFound";
  }
}

module.exports = {PropertyNotFound};