import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload } from "./auth.interface";
import jwt from "jsonwebtoken";

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
  const accessToken = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    { algorithm: "HS256", expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    { algorithm: "HS256", expiresIn: "15d" }
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

export const authServices = { loginUser };
