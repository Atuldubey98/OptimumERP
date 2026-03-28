class OrgNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "OrgNotFound";
  }
}

module.exports = { OrgNotFound };
