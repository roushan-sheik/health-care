import express from "express";
import { adminController } from "./admin.controller";

const router = express.Router();

router.route("/").get(adminController.getAllAdmin);
router.route("/:id").get(adminController.getAdminById);
router.route("/:id").patch(adminController.updateAdminById);
router.route("/:id").delete(adminController.deleteAdminById);
router.route("/soft/:id").delete(adminController.softDeleteAdminById);

export const adminRoutes = router;
