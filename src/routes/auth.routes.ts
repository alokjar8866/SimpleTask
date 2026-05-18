import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "../schema/auth.schema.js";

const router = Router();

router.post("/register",validate(registerSchema), register);
router.post("/login",validate(loginSchema), login);
 
export default router;
 