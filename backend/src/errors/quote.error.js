class QuoteNotFound extends Error {
    constructor() {
      super();
      this.code = 404;
      this.message = "Quote does not exists";
      this.name = "QuoteNotFound";
    }
  }
  
  module.exports = { QuoteNotFound };
  