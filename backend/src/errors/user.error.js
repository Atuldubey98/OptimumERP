class UserDuplicate extends Error {
  constructor() {
    super();
    this.code = 400;
    this.message = "User already exists";
    this.name = "UserDuplicate";
  }
}

class UserNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.message = "User does not exists";
    this.name = "UserNotFound";
  }
}
class PasswordDoesNotMatch extends Error {
  constructor() {
    super();
    this.code = 400;
    this.message = "Password does not match";
    this.name = "PasswordDoesNotMatch";
  }
}
class UnAuthenticated extends Error {
  constructor() {
    super();
    this.code = 401;
    this.message = "User not authenticated";
    this.name = "UnAuthenticated";
  }
}
class UnAuthorizedUser extends Error {
  constructor() {
    super();
    this.code = 403;
    this.message = "User not authorized";
    this.name = "UnAuthorizedUser";
  }
}
class InvalidOtp extends Error {
  constructor() {
    super();
    this.code = 400;
    this.message = "Invalid OTP";
    this.name = "InvalidOtp";
  }
}
class UpgradePlan extends Error {
  constructor() {
    super();
    this.code = 400;
    this.message = "Upgrade you plan";
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
  InvalidOtp,
};
