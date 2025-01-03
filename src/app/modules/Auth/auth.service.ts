import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPayload } from "./auth.interface";

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
  return { user, isPasswordCorrect };
};

export const authServices = { loginUser };
