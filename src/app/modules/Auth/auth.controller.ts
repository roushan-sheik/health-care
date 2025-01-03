import { Request, Response } from "express";
import AsyncHandler from "../../utils/AsyncHandler";
import { authServices } from "./auth.service";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";

const loginUser = AsyncHandler(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);
  SendResponse(res, { statusCode: StatusCodes.OK, data: result });
});

export const authController = { loginUser };
