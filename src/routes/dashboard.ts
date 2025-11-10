import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { summaryReportController } from "../controllers/dashboard.controller";

const router = Router()

router.get('/summary', verifyTokenMiddleware, asyncHandler(summaryReportController))

export { router }