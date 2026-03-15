import { Router } from "express";
import { getSkills, upsertSkill, levelUpSkill } from "../controllers/skill.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { skillSchema, levelUpSchema } from "../schemas/skill.schema";

const router = Router();

router.use(authenticate);

router.get("/", getSkills);
router.post("/", validate(skillSchema), upsertSkill);
router.patch("/:id/levelup", validate(levelUpSchema), levelUpSkill);

export default router;