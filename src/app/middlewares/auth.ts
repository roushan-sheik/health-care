/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelper";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

export const auth = (...roles: UserRole[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          message: "You are not authorized",
        });
        return;
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Forbidden! You are not authorized to access this route"
        );
      }
      req.user = verifiedUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};
