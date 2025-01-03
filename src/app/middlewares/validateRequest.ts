import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body });
      next();
    } catch (error) {
      next(error);
    }
  };
};
