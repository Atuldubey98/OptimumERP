const { Router } = require("express");
const {
  activate,
  currentUser,
  deactivate,
  forgotPassword,
  login,
  verifyOtp,
  logout,
  resetPassword,
  register,
  update,
  googleAuth,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const userRoutes = Router();

userRoutes.post("/register", requestAsyncHandler(register));
userRoutes.post("/login", requestAsyncHandler(login));
userRoutes.post("/googleAuth", requestAsyncHandler(googleAuth));
userRoutes.get("/", authenticate, requestAsyncHandler(currentUser));
userRoutes.patch("/", authenticate, requestAsyncHandler(update));
userRoutes.post("/logout", authenticate, requestAsyncHandler(logout));
userRoutes.post("/reset-password", authenticate, requestAsyncHandler(resetPassword));
userRoutes.post("/forgot-password", requestAsyncHandler(forgotPassword));
userRoutes.post("/forgot-password/reset", requestAsyncHandler(verifyOtp));
userRoutes.post("/:orgId/deactivate", authenticate, authorize, requestAsyncHandler(deactivate));
userRoutes.post("/:orgId/activate", authenticate, authorize, requestAsyncHandler(activate));

module.exports = userRoutes;
