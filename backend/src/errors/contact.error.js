class ContactNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Contact does not exists";
    this.name = "ContactNotFound";
  }
}

module.exports = { ContactNotFound };
