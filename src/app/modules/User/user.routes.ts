import express, { Request, Response } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userSchema } from "./user.validation";

const router = express();

router.route("/").get(userController.getAllUsers);
router.route("/").post(validateRequest(userSchema), userController.createAdmin);

export const userRoutes = router;
