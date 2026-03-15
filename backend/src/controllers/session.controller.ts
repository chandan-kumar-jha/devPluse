import { Request, Response } from "express";
import { Session } from "../models/Session";
import { SessionInput } from "../schemas/session.schema";

// GET /api/sessions
export const getSessions = async (req: Request, res: Response) => {
  const sessions = await Session.find({ user: req.user!._id }).sort({ date: -1 });
  res.status(200).json({ success: true, data: sessions });
};

// POST /api/sessions
export const createSession = async (req: Request, res: Response) => {
  const body = req.body as SessionInput;
  const session = await Session.create({ ...body, user: req.user!._id });
  res.status(201).json({ success: true, data: session });
};

// DELETE /api/sessions/:id
export const deleteSession = async (req: Request, res: Response) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user!._id });

  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return;
  }

  await session.deleteOne();
  res.status(200).json({ success: true, message: "Session deleted" });
};