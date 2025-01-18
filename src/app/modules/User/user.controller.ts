import { Request, Response } from "express";
import { userService } from "./user.service";

import { StatusCodes } from "http-status-codes";
import AsyncHandler from "../../utils/AsyncHandler";
import ApiResponse from "../../utils/ApiResponse";

const createAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req);
  res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, result, "Admin Creation Successful")
    );
});
const getAllUsers = AsyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUsersFromDB();
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, "All Users Data ").format());
});

export const userController = {
  createAdmin,
  getAllUsers,
};
