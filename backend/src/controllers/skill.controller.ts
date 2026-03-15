import { Request, Response } from "express";
import { Skill } from "../models/Skill";
import { SkillInput, LevelUpInput } from "../schemas/skill.schema";

// GET /api/skills
export const getSkills = async (req: Request, res: Response) => {
  const skills = await Skill.find({ user: req.user!._id }).sort({ name: 1 });
  res.status(200).json({ success: true, data: skills });
};

// POST /api/skills (upsert)
export const upsertSkill = async (req: Request, res: Response) => {
  const body = req.body as SkillInput;

  const skill = await Skill.findOneAndUpdate(
    { user: req.user!._id, name: body.name },
    { $set: body },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: skill });
};

// PATCH /api/skills/:id/levelup
export const levelUpSkill = async (req: Request, res: Response) => {
  const { increment } = req.body as LevelUpInput;

  const skill = await Skill.findOne({ _id: req.params.id, user: req.user!._id });

  if (!skill) {
    res.status(404).json({ success: false, message: "Skill not found" });
    return;
  }

  skill.currentLevel = Math.min(100, skill.currentLevel + increment);
  await skill.save();

  res.status(200).json({ success: true, data: skill });
};