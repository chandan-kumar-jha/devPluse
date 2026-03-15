import { Request, Response } from "express";
import { Goal } from "../models/Goal";
import { GoalInput, UpdateGoalInput } from "../schemas/goal.schema";

// GET /api/goals
export const getGoals = async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: any = { user: req.user!._id };
  if (status) filter.status = status;

  const goals = await Goal.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: goals });
};

// POST /api/goals
export const createGoal = async (req: Request, res: Response) => {
  const body = req.body as GoalInput;
  const goal = await Goal.create({ ...body, user: req.user!._id });
  res.status(201).json({ success: true, data: goal });
};

// PATCH /api/goals/:id
export const updateGoal = async (req: Request, res: Response) => {
  const body = req.body as UpdateGoalInput;

  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user!._id },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!goal) {
    res.status(404).json({ success: false, message: "Goal not found" });
    return;
  }

  res.status(200).json({ success: true, data: goal });
};

// DELETE /api/goals/:id
export const deleteGoal = async (req: Request, res: Response) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user!._id });

  if (!goal) {
    res.status(404).json({ success: false, message: "Goal not found" });
    return;
  }

  await goal.deleteOne();
  res.status(200).json({ success: true, message: "Goal deleted" });
};