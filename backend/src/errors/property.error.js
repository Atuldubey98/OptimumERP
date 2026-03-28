class PropertyNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "PropertyNotFound";
  }
}

module.exports = {PropertyNotFound};