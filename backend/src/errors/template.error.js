class TemplateNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "TemplateNotFound";
  }
}

class DefaultTemplateCannotBeDeleted extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "DefaultTemplateCannotBeDeleted";
  }
}

module.exports = { TemplateNotFound, DefaultTemplateCannotBeDeleted };
