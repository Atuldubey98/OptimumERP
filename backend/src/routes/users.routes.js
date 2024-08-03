const { Router } = require("express");
const {
  activate,
  currentUser,
  deactivate,
  forgotPassword,
  login,
  logout,
  resetPassword,
  register,
  update,
  updateGoogleAuth,
  getGoogleAuthorizationUri,
  googleAuth,
  verifyForgotPasswordOtp,
  verifyRegisteredUserOtp,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const userRoutes = Router();

userRoutes.post("/register", requestAsyncHandler(register));
userRoutes.post("/verify", requestAsyncHandler(verifyRegisteredUserOtp));
userRoutes.post("/login", requestAsyncHandler(login));
userRoutes.patch(
  "/googleAuth",
  authenticate,
  requestAsyncHandler(updateGoogleAuth)
);
userRoutes.post("/googleAuth", requestAsyncHandler(googleAuth));
userRoutes.get("/googleAuth", requestAsyncHandler(getGoogleAuthorizationUri));
userRoutes.get("/", authenticate, requestAsyncHandler(currentUser));
userRoutes.patch("/", authenticate, requestAsyncHandler(update));
userRoutes.post("/logout", authenticate, requestAsyncHandler(logout));
userRoutes.post(
  "/reset-password",
  authenticate,
  requestAsyncHandler(resetPassword)
);
userRoutes.post("/forgot-password", requestAsyncHandler(forgotPassword));
userRoutes.post(
  "/forgot-password/reset",
  requestAsyncHandler(verifyForgotPasswordOtp)
);
userRoutes.post(
  "/:orgId/deactivate",
  authenticate,
  authorize,
  requestAsyncHandler(deactivate)
);
userRoutes.post(
  "/:orgId/activate",
  authenticate,
  authorize,
  requestAsyncHandler(activate)
);

module.exports = userRoutes;
