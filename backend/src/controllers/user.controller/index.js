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
const verifyForgotPasswordOtp = require("./verifyForgotPasswordOtp");
const getGoogleAuthorizationUri = require("./getGoogleAuthorizationUri");
const verifyRegisteredUserOtp = require("./verifyRegisteredUserOtp");
const googleAuth = require("./googleAuth");
const resendVerificationLink = require("./resendVerificationOtp");
const uploadAvatar = require("./uploadAvatar");
const removeAvatar = require("./removeAvatar");
module.exports = {
  activate,
  uploadAvatar,
  resendVerificationLink,
  currentUser,
  googleAuth,
  removeAvatar,
  getGoogleAuthorizationUri,
  deactivate,
  verifyForgotPasswordOtp,
  verifyRegisteredUserOtp,
  forgotPassword,
  login,
  logout,
  resetPassword,
  update,
  register,
  updateGoogleAuth,
};
