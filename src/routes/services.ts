import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addServiceController, deleteServiceController, getServiceListController, listActivesController, listServicesForQuotesController, updateServiceController, amarrarProductosController } from "../controllers/service.controller";

const router = Router();

router.post('/', verifyTokenMiddleware, asyncHandler(addServiceController))
router.get('/:establishment_id', verifyTokenMiddleware, asyncHandler(getServiceListController));
router.delete('/:id', verifyTokenMiddleware, asyncHandler(deleteServiceController));
router.get('/actives/:establishment_id', verifyTokenMiddleware, asyncHandler(listActivesController));
router.put('/:id', verifyTokenMiddleware, asyncHandler(updateServiceController));
router.post('/quotes', asyncHandler(listServicesForQuotesController));
router.post('/amarrar-productos', asyncHandler(amarrarProductosController));

export { router };