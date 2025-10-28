import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { listSalesController } from "../controllers/sale.controller";

const router = Router();

router.get('/:establishmentId', verifyTokenMiddleware, asyncHandler(listSalesController))

export { router }