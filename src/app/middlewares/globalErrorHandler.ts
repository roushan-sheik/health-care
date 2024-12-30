import { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.name || "Something went wrong",
    error: err,
  });
};
