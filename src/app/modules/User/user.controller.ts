import { Request, Response } from "express";
import { userService } from "./user.service";

import { StatusCodes } from "http-status-codes";
import AsyncHandler from "../../utils/AsyncHandler";
import ApiResponse from "../../utils/ApiResponse";

const createAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);
  res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, result, "Admin Creation Successful")
    );
});

export const userController = {
  createAdmin,
};
