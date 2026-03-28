class ContactNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "ContactNotFound";
  }
}

module.exports = { ContactNotFound };
