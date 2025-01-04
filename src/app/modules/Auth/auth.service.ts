import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload, IRefreshTokenResponse } from "./auth.interface";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import { UserStatus } from "@prisma/client";
import ApiError from "../../utils/ApiError";

// Login user =====================>
const loginUser = async (payload: IPayload) => {
  const { username, email, password } = payload;
  // check email or username is required or not
  if (!username && !email) {
    throw new Error("Email or username is required");
  }
  // find user by email or username and check user status
  const user = await prisma.user.findFirstOrThrow({
    where: {
      status: UserStatus.ACTIVE,
      OR: [{ email: email }, { username: username }],
    },
  });
  if (!user) {
    throw new Error("User Dose not exist");
  }
  // check password is correct or not
  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  // generate access token and refresh token
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
  // update refresh token in user table
  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

// Refresh token =====================>
const refreshToken = async (
  incomingRefreshToken: string
): Promise<IRefreshTokenResponse | void> => {
  // check  token have or not or throw an error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "You are not authorized");
  }
  // use trycatch block to handle error
  try {
    // decode token
    const decodedData: JwtPayload | null = jwtHelpers.verifyToken(
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      incomingRefreshToken
    );
    // find user by decoded email
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: decodedData?.email,
        status: UserStatus.ACTIVE,
      },
    });
    // check user have or not
    if (!user) {
      throw new ApiError(401, "You are not authorized");
    }
    // check refresh token is same or not
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "You are not authorized");
    }
    // generate new access token and refresh token
    const accessToken = jwtHelpers.generateToken(
      { email: decodedData?.email, role: decodedData?.role },
      process.env.JWT_ACCESS_TOKEN_SECRET as string,
      "5m"
    );
    const refreshToken = jwtHelpers.generateToken(
      { email: decodedData?.email, role: decodedData?.role },
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      "15d"
    );
    // update refresh token in user table
    await prisma.user.update({
      where: {
        email: decodedData?.email,
      },
      data: {
        refreshToken,
      },
    });
    return {
      accessToken,
      refreshToken,
      needPasswordChange: user.needPasswordChange,
    };
  } catch (error) {
    new ApiError(401, "Invalid refresh token");
  }
};

export const authServices = { loginUser, refreshToken };
