import express, { Request, Response } from "express";
import { userController } from "./user.controller";

const router = express();

router.route("/user").get(userController.getAllUsers);
router.route("/user").post(userController.createAdmin);

export const userRoutes = router;
