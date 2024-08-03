const activate = require("./activate");
const currentUser = require("./current_user");
const deactivate = require("./deactivate");
const forgotPassword = require("./forgotPassword");
const updateGoogleAuth = require("./updateGoogleAuth");
const login = require("./login");
const logout = require("./logout");
const register = require("./register");
const resetPassword = require("./resetPassword");
const update = require("./update");
const verifyOtp = require("./verifyOtp");
const getGoogleAuthorizationUri = require("./getGoogleAuthorizationUri");
const googleAuth = require("./googleAuth");
module.exports = {
  activate,
  currentUser,
  googleAuth,
  getGoogleAuthorizationUri,
  deactivate,
  verifyOtp,
  forgotPassword,
  login,
  logout,
  resetPassword,
  update,
  register,
  updateGoogleAuth,
};
