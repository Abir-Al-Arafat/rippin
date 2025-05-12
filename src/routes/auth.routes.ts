import express from "express";
import { Request, Response, NextFunction, RequestHandler } from "express";

import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
} from "../controllers/auth.controller";
import multer from "multer";

import { userValidator, authValidator } from "../middlewares/validation";
import {
  isAuthorizedUser,
  isAuthorizedAdmin,
  isAuthorizedSuperAdmin,
} from "../middlewares/authValidationJWT";
// const { authValidator } = require("../middleware/authValidation");
const routes = express();
const upload = multer();
// for signing up
routes.post(
  "/signup",
  // userValidator.create,
  // authValidator.create,
  upload.none(),
  signup
);

// routes.post(
//   "/send-verification-code-to-phone",
//   // userValidator.create,
//   // authValidator.create,
//   upload.none(),
//   sendVerificationCodeToPhone
// );

routes.post("/verify-otp", verifyEmail);

routes.post(
  "/forgot-password",
  // userValidator.create,
  // authValidator.create,
  forgotPassword
);

routes.post(
  "/reset-password",
  // userValidator.create,
  // authValidator.create,
  resetPassword
);

routes.post(
  "/change-password",
  // userValidator.create,
  // authValidator.create,
  changePassword
);

routes.post("/login", login);

routes.post("/logout", logout);

// routes.post(
//   "/auth/create-admin",
//   // userValidator.create,
//   // authValidator.create,
//   isAuthorizedSuperAdmin,
//   createAdmin
// );

// routes.post(
//   "/auth/connect-stripe-account",
//   isAuthorizedUser,
//   connectStripeAccount
// );

// routes.post("/auth/send-otp-again", sendOTPAgain);

// // for logging in
// routes.post("/auth/logout", logout);

export default routes;
