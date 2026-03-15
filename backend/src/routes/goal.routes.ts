import { Router } from "express";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../controllers/goal.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { goalSchema, updateGoalSchema } from "../schemas/goal.schema";

const router = Router();

router.use(authenticate);

router.get("/", getGoals);
router.post("/", validate(goalSchema), createGoal);
router.patch("/:id", validate(updateGoalSchema), updateGoal);
router.delete("/:id", deleteGoal);

export default router;