import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { historyPaymentController, listSalesController, paymentSaleController } from "../controllers/sale.controller";

const router = Router();

router.get('/:establishmentId', verifyTokenMiddleware, asyncHandler(listSalesController));
router.post('/payments', verifyTokenMiddleware, asyncHandler(paymentSaleController));
router.get('/history-payments/:saleId', verifyTokenMiddleware, asyncHandler(historyPaymentController));

export { router }