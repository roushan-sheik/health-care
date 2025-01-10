import express from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.route("/login").post(authController.loginUser);
router.route("/refresh-token").post(authController.refreshedToken);
router.route("/logout").post(authController.logOutUser);
router
  .route("/change-password")
  .post(
    auth(
      UserRole.ADMIN,
      UserRole.DOCTOR,
      UserRole.PATIENT,
      UserRole.SUPER_ADMIN
    ),
    authController.changePassword
  );
router
  .route("/forgot-password")
  .post(
    auth(
      UserRole.ADMIN,
      UserRole.DOCTOR,
      UserRole.PATIENT,
      UserRole.SUPER_ADMIN
    ),
    authController.forgotPassword
  );

export default router;
