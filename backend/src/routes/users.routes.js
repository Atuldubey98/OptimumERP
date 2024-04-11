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
  activateUser,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/", authenticate, currentUser);
userRoutes.post("/logout", authenticate, logoutUser);
userRoutes.post("/reset-password", authenticate, resetPassword);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/forgot-password/reset", verifyOtpForgotPasswordAndReset);
userRoutes.post("/:orgId/deactivate", authenticate, authorize, deactivateUser);
userRoutes.post("/:orgId/activate", authenticate, authorize, activateUser);

module.exports = userRoutes;
