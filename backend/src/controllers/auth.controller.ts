import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: "Email already in use" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email },
  });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email },
  });
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user!._id,
      name: req.user!.name,
      email: req.user!.email,
    },
  });
};

// POST /api/auth/logout
export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out" });
};