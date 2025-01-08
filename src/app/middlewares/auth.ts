import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelper";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../utils/ApiError";

export const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          message: "You are not authorized",
        });
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(401, "You are not authorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
