const { Router } = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  deactivateUser,
  resetPassword,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/", authenticate, currentUser);
userRoutes.post("/logout", authenticate, logoutUser);
userRoutes.post("/deactivate", authenticate, deactivateUser);
userRoutes.post("/reset-password", authenticate, resetPassword);

module.exports = userRoutes;
