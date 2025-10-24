import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addBuildYourMenuController, addStructureMenuController, addTypeMenuController, listBuildYourMenuController, listStructureMenuController, listTypeMenuController } from "../controllers/menu.controller";

const router = Router();

router.post('/type-menu', verifyTokenMiddleware, asyncHandler(addTypeMenuController));
router.get('/type-menu/:establishmentId', verifyTokenMiddleware, asyncHandler(listTypeMenuController));
router.post('/structure-menu', verifyTokenMiddleware, asyncHandler(addStructureMenuController))
router.get('/structure-menu/:establishmentId', verifyTokenMiddleware, asyncHandler(listStructureMenuController));
router.post('/build-your-menu', verifyTokenMiddleware, asyncHandler(addBuildYourMenuController));
router.get('/build-your-menu/:establishmentId', verifyTokenMiddleware, asyncHandler(listBuildYourMenuController));


export { router }