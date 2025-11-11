import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { getChartsController, getKPIsController, summaryReportController } from "../controllers/dashboard.controller";

const router = Router()

router.get(
  '/summary',
  asyncHandler(summaryReportController)
)

// Endpoint opcional - Solo KPIs (más rápido si solo necesitas eso)
router.get(
  '/kpis',
  verifyTokenMiddleware,
  asyncHandler(getKPIsController)
)

// Endpoint opcional - Solo gráficos
router.get(
  '/charts',
  verifyTokenMiddleware,
  asyncHandler(getChartsController)
)

export { router }