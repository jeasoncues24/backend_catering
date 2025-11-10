import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addTypesGuidesController, addWarehouseController, listWarehouseController, listTypesGuidesController, informationGuideController, addDetailGuideController } from "../controllers/warehouse.controller";

const router = Router()

router.get('/:establishmentId', asyncHandler(listWarehouseController))
router.post('/', verifyTokenMiddleware, asyncHandler(addWarehouseController))
router.post('/add-guides', verifyTokenMiddleware, asyncHandler(addTypesGuidesController))
router.get('/guides/:establishmentId', verifyTokenMiddleware, asyncHandler(listTypesGuidesController))

router.get('/guide/:guideId', asyncHandler(informationGuideController))

router.post('/add-detail/:guideId', asyncHandler(addDetailGuideController))

export { router }