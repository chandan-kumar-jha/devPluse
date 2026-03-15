import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};