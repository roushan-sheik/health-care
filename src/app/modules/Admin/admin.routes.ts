import express from "express";
import { adminController } from "./admin.controller";

const router = express.Router();

router.route("/admin").get(adminController.getAllAdmin);

export const adminRoutes = router;
