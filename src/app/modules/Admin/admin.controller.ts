import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AsyncHandler from "../../utils/AsyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { pik } from "../../../shared/pik";
import { adminFilterAbleFields } from "./admin.constant";
import { adminService } from "./admin.service";

const getAllAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const filters = pik(req.query, adminFilterAbleFields);
  const options = pik(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  console.log("options:", options);

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
const getAdminById = AsyncHandler(async (req: Request, res: Response) => {
  console.log(req.params.id);

  const result = await adminService.getAdminByIdFromDB(req.params.id);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "Admin data").format());
});

export const adminController = { getAllAdmin, getAdminById };
