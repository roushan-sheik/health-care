import { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload } from "./auth.interface";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import { UserStatus } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import config from "../../../config";
import { StatusCodes } from "http-status-codes";

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
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  // generate access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expiration as string
  );
  const refreshToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expiration as string
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
//log out user =====================>
const logOutUser = async (refreshToken: string) => {
  // check  token have or not or throw an error
  if (!refreshToken) {
    throw new ApiError(401, "You are not authorized");
  }
  // use try catch block to handle error
  try {
    // decode token
    const decodedData: JwtPayload | null = jwtHelpers.verifyToken(
      refreshToken,
      config.jwt.refresh_token_secret as string
    );

    // update refresh token in user table
    await prisma.user.update({
      where: {
        email: decodedData?.email,
      },
      data: {
        refreshToken: "",
      },
    });
    return {
      message: "Logout successfully",
    };
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }
};
// Refresh token =====================>
const refreshedToken = async (incomingRefreshToken: string) => {
  // check  token have or not or throw an error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "You are not authorized");
  }

  // decode token
  const decodedData: JwtPayload = jwtHelpers.verifyToken(
    incomingRefreshToken,
    config.jwt.refresh_token_secret as Secret
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
  const newAccessToken = jwtHelpers.generateToken(
    { email: decodedData?.email, role: decodedData?.role },
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expiration as string
  );
  const newRefreshToken = jwtHelpers.generateToken(
    { email: decodedData?.email, role: decodedData?.role },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expiration as string
  );
  // update refresh token in user table
  await prisma.user.update({
    where: {
      email: decodedData?.email,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};
//  Change password =====================>
const changePassword = async (user: object, payload: object) => {
  // check  token have or not or throw an error
  if (!user) {
    throw new ApiError(401, "You are not authorized");
  }
  // find user by email
  const userByEmail = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  // check password is correct or not
  const isPasswordCorrect = await bcrypt.compare(
    payload.oldPassword,
    userByEmail.password
  );
  if (!isPasswordCorrect) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid email or password");
  }
  // hash the user password
  const hashedPassword = await bcrypt.hash(payload.oldPassword, 10);
  // update password in user table
  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "Password changed successfully",
  };
};
export const authServices = {
  loginUser,
  refreshedToken,
  logOutUser,
  changePassword,
};
