/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload } from "./auth.interface";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import { UserStatus } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import config from "../../../config";
import { StatusCodes } from "http-status-codes";
import emailSender from "./emailSender";

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
const changePassword = async (user: any, payload: any) => {
  // check  token have or not or throw an error
  if (!user) {
    throw new ApiError(401, "You are not authorized");
  }
  // find user by email
  const userByEmail = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
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
//  Change password =====================>
// Steps algorithm
// 1. Find user by email  and check user status
// 2. Generate reset password token
// 3. Make a link with email and token
// 5. create a file called emailSender.ts
// 6. go to nodemailer and copy the example  code
// 7. create a emailSender function paste the code and export it
// 8. change auth user email and password
// 9. change host it will be gmail host "smtp.gmail.com" search on google
// 10. remove the main function make emailSender function async
// 11. you will find those in your google account App password
// 12. https://myaccount.google.com/apppasswords
// 13. change transport object info like, from , to , html body
//* 14. make reset password route for reset the password
// 15. find user by email and check user status
// 16. verify the token
// 17. hash the password
// 18. update the password

const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  // generate access token and refresh token
  const resetPassToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    config.jwt.reset_token_secret as Secret,
    config.jwt.reset_token_expiration as string
  );
  const resetPasswordLink = `${config.reset_password_link}?email=${user.email}&token=${resetPassToken}`;

  await emailSender(
    user.email,
    `
    <div>
      <h1>Reset Password</h1>
      <p>Click this link to reset your password</p>
      <a href="${resetPasswordLink}">
        <button>Reset Password</button>
      </a>
    </div>
    `
  );
  return {
    email: payload.email,
    message: "Password changed successfully",
  };
};
const resetPassword = async (token: string, payload: any) => {
  // reset password
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_token_secret as Secret
  );
  if (!isValidToken) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden! Invalid token");
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      password: hashedPassword,
    },
  });
};
export const authServices = {
  loginUser,
  refreshedToken,
  logOutUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
