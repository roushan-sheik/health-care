import { Request, Response } from "express";
import { getAdminsDataFromDB } from "./admin.service";
import { StatusCodes } from "http-status-codes";
import AsyncHandler from "../../utils/AsyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { pik } from "../../../shared/pik";
import { adminFilterAbleFields } from "./admin.constant";

const getAllAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const filters = pik(req.query, adminFilterAbleFields);
  const options = pik(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  console.log("options:", options);

  const result = await getAdminsDataFromDB(filters, options);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "All Admins Data"));
});

export const adminController = { getAllAdmin };
