class PartyNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "Party does not exists";
    this.name = "PartyNotFound";
  }
}

class PartyNotDelete extends Error {
  constructor({ reason = "Party not deleted" }) {
    super();
    this.code = 400;
    this.message = reason;
    this.name = "PartyNotDelete";
  }
}

module.exports = { PartyNotFound, PartyNotDelete };
