import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { listPaymentsController } from "../controllers/payment.controller";

const router = Router();

router.get('/:establishmentId', verifyTokenMiddleware, asyncHandler(listPaymentsController))

export { router }