import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload } from "./auth.interface";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import { UserStatus } from "@prisma/client";

// Login user =====================>
const loginUser = async (payload: IPayload) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  // compare password
  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  const accessToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    "5m"
  );
  const refreshToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    "15d"
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

// Refresh token =====================>
const refreshToken = async (token: string) => {
  if (!token) {
    throw new Error("You are not authorized");
  }
  const decodedData: JwtPayload | null = jwtHelpers.verifyToken(
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    token
  );

  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (isUserExist) {
    throw new Error("Invalid");
  }
  const accessToken = jwtHelpers.generateToken(
    { email: decodedData?.email, role: decodedData?.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    "5m"
  );
  return { accessToken, needPasswordChange: isUserExist.needPasswordChange };
};

export const authServices = { loginUser, refreshToken };
