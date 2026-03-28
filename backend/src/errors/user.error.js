class UserDuplicate extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UserDuplicate";
  }
}

class UserNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "UserNotFound";
  }
}
class PasswordDoesNotMatch extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "PasswordDoesNotMatch";
  }
}
class UnAuthenticated extends Error {
  constructor() {
    super();
    this.code = 401;
    this.name = "UnAuthenticated";
  }
}
class UnAuthorizedUser extends Error {
  constructor() {
    super();
    this.code = 403;
    this.name = "UnAuthorizedUser";
  }
}
class InvalidOtp extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "InvalidOtp";
  }
}
class UserNotVerified extends Error {
  constructor() {
    super();
    this.code = 403;
    this.name = "UserNotVerified";
  }
}
class UpgradePlan extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UpgradePlan";
  }
}

module.exports = {
  UserDuplicate,
  UserNotFound,
  UpgradePlan,
  PasswordDoesNotMatch,
  UnAuthenticated,
  UnAuthorizedUser,
  UserNotVerified,
  InvalidOtp,
};
