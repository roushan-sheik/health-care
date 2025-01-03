import express from "express";
import { adminController } from "./admin.controller";
import { userSchema } from "../User/user.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

router.route("/").get(adminController.getAllAdmin);
router.route("/:id").get(adminController.getAdminById);
router
  .route("/:id")
  .patch(validateRequest(userSchema), adminController.updateAdminById);
router.route("/:id").delete(adminController.deleteAdminById);
router.route("/soft/:id").delete(adminController.softDeleteAdminById);

export const adminRoutes = router;
