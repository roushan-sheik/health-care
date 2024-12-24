import { Request, Response } from "express";
import { userService } from "./user.service";

const createAdmin = async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);
  res.status(200).json(result);
};

export const userController = {
  createAdmin,
};
