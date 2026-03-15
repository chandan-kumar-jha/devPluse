import { Router } from "express";
import { getSessions, createSession, deleteSession } from "../controllers/session.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { sessionSchema } from "../schemas/session.schema";

const router = Router();

router.use(authenticate); // all session routes require auth

router.get("/", getSessions);
router.post("/", validate(sessionSchema), createSession);
router.delete("/:id", deleteSession);

export default router;