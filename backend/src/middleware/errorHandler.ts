import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MongooseError } from "mongoose";

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`);

  // Zod validation error (shouldn't reach here normally, but just in case)
  if (err instanceof ZodError) {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });
  return;
}

  // Mongoose duplicate key error (e.g. duplicate email or skill name)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Mongoose cast error (e.g. invalid ObjectId in URL param)
  if ((err as any).name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Custom app errors with a statusCode
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Fallback — 500
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};