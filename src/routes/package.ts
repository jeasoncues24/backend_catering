import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addInformationPackageController, addPackageController, getPackagesByEstablishmentController, informationPackageController, detailForProformaController } from "../controllers/package.controller";

const router = Router();

router.post('/', verifyTokenMiddleware, asyncHandler(addPackageController));
router.get('/:establishment_id', verifyTokenMiddleware, asyncHandler(getPackagesByEstablishmentController));
router.get('/detail/:id', verifyTokenMiddleware, asyncHandler(informationPackageController));
router.post('/add-detail', verifyTokenMiddleware, asyncHandler(addInformationPackageController));
router.get('/detail-proforma/:id', verifyTokenMiddleware, asyncHandler(detailForProformaController));

export { router }