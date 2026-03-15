import { Router } from "express";
import { register, login, getMe, logout } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;