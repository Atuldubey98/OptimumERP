class OrgNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Organization does not exists";
    this.name = "OrgNotFound";
  }
}

module.exports = { OrgNotFound };
