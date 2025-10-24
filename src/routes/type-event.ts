import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addTypeEventController, listAllActivesTypesEventsController, listAllTypesEventsController } from "../controllers/event.controller";

const router = Router();

router.get("/:establishment_id", verifyTokenMiddleware, asyncHandler(listAllTypesEventsController));
router.post("/", verifyTokenMiddleware, asyncHandler(addTypeEventController));
router.get("/:establishment_id/actives", verifyTokenMiddleware, asyncHandler(listAllActivesTypesEventsController));

export { router }