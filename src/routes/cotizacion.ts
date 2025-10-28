import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addCotizacionController, listCotizacionesController, getCotizacionDetailController, convertCotizacionToSaleController, updateStatusCotizacionController } from "../controllers/cotizacion.controller";

const router = Router();


router.post('/', verifyTokenMiddleware, asyncHandler(addCotizacionController));
router.get('/:establihsmentId', verifyTokenMiddleware, asyncHandler(listCotizacionesController));
router.get('/detail/:cotizacionId', verifyTokenMiddleware, asyncHandler(getCotizacionDetailController));
router.post('/:quoteId/convert', verifyTokenMiddleware, asyncHandler(convertCotizacionToSaleController));
router.put('/:quoteId/status', verifyTokenMiddleware, asyncHandler(updateStatusCotizacionController));

export { router };
