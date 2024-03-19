const { Router } = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  deactivateUser,
  resetPassword,
  forgotPassword,
  verifyOtpForgotPasswordAndReset,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/", authenticate, currentUser);
userRoutes.post("/logout", authenticate, logoutUser);
userRoutes.post("/deactivate", authenticate, deactivateUser);
userRoutes.post("/reset-password", authenticate, resetPassword);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/forgot-password/reset", verifyOtpForgotPasswordAndReset);

module.exports = userRoutes;
