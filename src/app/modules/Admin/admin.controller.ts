import { Request, Response } from "express";
import { getAdminsDataFromDB } from "./admin.service";
import { StatusCodes } from "http-status-codes";
import AsyncHandler from "../../utils/AsyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { pik } from "../../../shared/pik";

const getAllAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const filters = pik(req.query, [
    "name",
    "email",
    "searchTerm",
    "contactNumber",
  ]);
  console.log(filters);
  const result = await getAdminsDataFromDB(filters);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "All Admins Data"));
});

export const adminController = { getAllAdmin };
