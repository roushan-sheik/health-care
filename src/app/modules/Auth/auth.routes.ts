import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.route("/").post(authController.loginUser);
router.route("/refresh-token").post(authController.refreshToken);

export default router;
