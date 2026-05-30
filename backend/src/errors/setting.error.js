class SettingNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "SettingNotFound";
  }
}

class ProviderNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "ProviderNotFound";
  }
}

module.exports = { SettingNotFound, ProviderNotFound };
