import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.route("/login").post(authController.loginUser);
router.route("/refresh-token").post(authController.refreshedToken);
router.route("/logout").post(authController.logOutUser);

export default router;
