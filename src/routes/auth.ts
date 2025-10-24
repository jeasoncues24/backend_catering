import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginController, refreshTokenController, registerController } from "../controllers/auth.controller";

const router = Router();


router.post("/register", asyncHandler(registerController));
router.post("/login", asyncHandler(loginController));
router.post("/refresh", asyncHandler(refreshTokenController));

export { router }