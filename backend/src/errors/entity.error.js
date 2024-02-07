class EntityNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "User does not exists";
    this.name = "EntityNotFound";
  }
}

module.exports = { EntityNotFound };
