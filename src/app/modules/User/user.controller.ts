import { Request, Response } from "express";
import { userService } from "./user.service";
import AsyncHandler from "../../../utils/AsyncHandler";
import ApiResponse from "../../../utils/ApiResponse";

const createAdmin = AsyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, result, "Admin Creation Successful"));
});

export const userController = {
  createAdmin,
};
