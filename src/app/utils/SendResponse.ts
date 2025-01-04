import { Response } from "express";

// Send Response ====================================>
export const SendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    data?: T | null | undefined;
    message?: string;
    meta?: {
      page: number;
      limit: number;
      total: number;
    };
  }
) => {
  // destructure
  const { statusCode, data, message, meta } = jsonData;
  // send response
  res.status(statusCode).json({
    success: statusCode < 400,
    message: statusCode >= 400 ? "Failed" : message || "Successful",
    meta: meta || null || undefined,
    data: data || null || undefined,
  });
};
