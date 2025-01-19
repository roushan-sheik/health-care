import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserPayloadSchema } from "./user.validation";
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
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
      req.body = validateRequest(
        UserPayloadSchema.parse(JSON.parse(req.body.data))
      );
      return userController.createAdmin(req, res, next);
    }
  );

export const userRoutes = router;
