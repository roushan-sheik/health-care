import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";

const createAdmin = async (req: Request) => {
  // file upload
  const file = req.file;

  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    console.log("uploadResult >>>::::", uploadResult);
  }

  // hash the user password
  const hashedPassword = await bcrypt.hash(req.body.data.password, 10);

  const userData = {
    username: req.body.data?.admin?.username,
    email: req.body.data.admin?.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };
  const result = await prisma.$transaction(async (transactionClient) => {
    // user creation
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: req.body.data.admin,
    });
    return createdAdminData;
  });
  return result;
};

// get all users

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany();
  return result;
};

export const userService = {
  createAdmin,
  getAllUsersFromDB,
};
