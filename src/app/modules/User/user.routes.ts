import express, { Request, Response } from "express";
import { userController } from "./user.controller";

const router = express();

router.route("/").get(userController.getAllUsers);
router.route("/").post(userController.createAdmin);

export const userRoutes = router;
