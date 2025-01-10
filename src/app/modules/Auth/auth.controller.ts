/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import AsyncHandler from "../../utils/AsyncHandler";
import { authServices } from "./auth.service";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError";
import { cookieOptions } from "../../constants";

const loginUser = AsyncHandler(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);
  // set accessToken to the cookie
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  // send response with accessToken
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const logOutUser = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    // status 401
    throw new ApiError(401, "You are not authorized");
  }
  await authServices.logOutUser(refreshToken);

  // remove refreshToken from the cookie
  res.clearCookie("refreshToken");

  SendResponse(res, {
    statusCode: 200,
    message: "Logout successful",
  });
});

const refreshedToken = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    // status 401
    throw new ApiError(401, "You are not authorized");
  }

  const result = await authServices.refreshedToken(refreshToken);

  // set accessToken to the cookie
  res.cookie("refreshToken", result?.refreshToken, cookieOptions);

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Token refreshed",
    data: {
      accessToken: result?.accessToken,
      needPasswordChange: result?.needPasswordChange,
    },
  });
});
const changePassword = AsyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.changePassword(req.user, req.body);
    // remove refreshToken from the cookie
    res.clearCookie("refreshToken");

    SendResponse(res, {
      statusCode: 200,
      message: "Password changed successfully",
      data: result,
    });
  }
);
const forgotPassword = AsyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.forgotPassword(req.body);
    // remove refreshToken from the cookie
    res.clearCookie("refreshToken");

    SendResponse(res, {
      statusCode: 200,
      message: "Password changed successfully",
      data: result,
    });
  }
);
const resetPassword = AsyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const token = req.headers.authorization || "";

    const result = await authServices.resetPassword(token, req.body);
    // remove refreshToken from the cookie
    res.clearCookie("refreshToken");

    SendResponse(res, {
      statusCode: 200,
      message: "Password Reset successfully",
      data: null,
    });
  }
);
export const authController = {
  loginUser,
  refreshedToken,
  logOutUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
