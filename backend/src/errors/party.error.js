class PartyNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "PartyNotFound";
  }
}

class PartyNotDelete extends Error {
  constructor({ reason }) {
    super();
    this.code = 400;
    this.name = "PartyNotDelete";
    this.params = { reason };
  }
}

module.exports = { PartyNotFound, PartyNotDelete };
