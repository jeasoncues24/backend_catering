import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addLocalController, listLocalesActivesController, listLocalesController } from "../controllers/local.controller";

const router = Router();


router.get("/:establishment_id", verifyTokenMiddleware, asyncHandler(listLocalesController));
router.post("/", verifyTokenMiddleware, asyncHandler(addLocalController))
router.get("/:establishment_id/actives", verifyTokenMiddleware, asyncHandler(listLocalesActivesController));

export { router }