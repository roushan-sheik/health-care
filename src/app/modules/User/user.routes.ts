import express, { Request, Response } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userSchema } from "./user.validation";
import { auth } from "../../middlewares/auth";

const router = express();

router.route("/").get(auth("ADMIN", "SUPER_ADMIN"), userController.getAllUsers);
router
  .route("/")
  .post(
    auth("ADMIN", "SUPER_ADMIN"),
    validateRequest(userSchema),
    userController.createAdmin
  );

export const userRoutes = router;
