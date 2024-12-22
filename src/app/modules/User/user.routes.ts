import express, { Request, Response } from "express";
import { userController } from "./user.controller";

const router = express();

router.route("/users").get(userController.createAdmin);

export const userRoutes = router;
