import express from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userSchema } from "./user.validation";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";

const router = express.Router();

router
  .route("/")
  .get(auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), userController.getAllUsers);

router
  .route("/")
  .post(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT),
    fileUploader.upload.single("file"),
    validateRequest(userSchema),
    userController.createAdmin
  );

export const userRoutes = router;
