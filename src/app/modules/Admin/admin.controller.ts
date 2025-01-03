import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AsyncHandler from "../../utils/AsyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { pik } from "../../../shared/pik";
import { adminFilterAbleFields } from "./admin.constant";
import { adminService } from "./admin.service";
import { SendResponse } from "../../utils/SendResponse";

// get admins from db
const getAllAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const filters = pik(req.query, adminFilterAbleFields);
  const options = pik(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await adminService.getAdminsDataFromDB(filters, options);
  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        result.data,
        "Admin data",
        result.meta
      ).format()
    );
});
// Get admin by id
const getAdminById = AsyncHandler(async (req: Request, res: Response) => {
  console.log(req.params.id);

  const result = await adminService.getAdminByIdFromDB(req.params.id);

  SendResponse(res, { statusCode: StatusCodes.OK, data: result });
});
// Update admin by id
const updateAdminById = AsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await adminService.updateAdminByIdFromDB(id, payload);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "Updated Successful"));
});
// Delete admin by id from db

const deleteAdminById = AsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = adminService.softDeleteAdminByIdFromDB(id);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "Deleted Successful"));
});
// Delete admin by id from db

const softDeleteAdminById = AsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = adminService.softDeleteAdminByIdFromDB(id);
    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Deleted Successful"));
  }
);

export const adminController = {
  getAllAdmin,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  softDeleteAdminById,
};
