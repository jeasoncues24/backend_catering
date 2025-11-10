import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addProviderController, listAllProviderController, listProviderActivesController } from "../controllers/provider.controller";

const router = Router();


router.get("/:establishment_id", verifyTokenMiddleware, asyncHandler(listAllProviderController));
router.post("/", verifyTokenMiddleware, asyncHandler(addProviderController))
router.get("/:establishment_id/active", asyncHandler(listProviderActivesController));

export { router }