import express from "express";
import { adminController } from "./admin.controller";

const router = express.Router();

router.route("/admin").get(adminController.getAllAdmin);
router.route("/admin/:id").get(adminController.getAdminById);

export const adminRoutes = router;
