import express from "express";
import { adminController } from "./admin.controller";

const router = express.Router();

router.route("/admin").get(adminController.getAllAdmin);
router.route("/admin/:id").get(adminController.getAdminById);
router.route("/admin/:id").patch(adminController.updateAdminById);
router.route("/admin/:id").delete(adminController.deleteAdminById);
router.route("/admin/soft/:id").delete(adminController.softDeleteAdminById);

export const adminRoutes = router;
