const activate = require("./activate");
const currentUser = require("./current_user");
const deactivate = require("./deactivate");
const forgotPassword = require("./forgot_password");
const login = require("./login");
const logout = require("./logout");
const register = require("./register");
const resetPassword = require("./reset_password");
const update = require("./update");
const verifyOtp = require("./verify_otp");
module.exports = {
  activate,
  currentUser,
  deactivate,
  verifyOtp,
  forgotPassword,
  login,
  logout,
  resetPassword,
  update,
  register,
};
