import { Request, Response } from "express";
import AsyncHandler from "../../../utils/AsyncHandler";
import { getAdminsDataFromDB } from "./admin.service";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../../../utils/ApiResponse";

const getAllAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const result = await getAdminsDataFromDB(req.query);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "All Admins Data"));
});

export const adminController = { getAllAdmin };
