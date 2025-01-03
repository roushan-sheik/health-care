import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload } from "./auth.interface";
import { generateToken } from "../../../helpers/generateToken";

const loginUser = async (payload: IPayload) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
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
  const accessToken = generateToken(
    { email: user.email, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    "5m"
  );
  const refreshToken = generateToken(
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

const refreshToken = async (refreshToken: string) => {
  console.log("Cookie thake token:", refreshToken);
  return refreshToken;
};

export const authServices = { loginUser, refreshToken };
