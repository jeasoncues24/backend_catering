import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addCategoryProductController, listCategoryProductController, listCategoryProductsActivesController } from "../controllers/categoryproducts.controller";

const router = Router();

router.post('/',  verifyTokenMiddleware, asyncHandler(addCategoryProductController));
router.get('/:establishment_id', verifyTokenMiddleware, asyncHandler(listCategoryProductController));
router.get('/actives/:establishment_id', asyncHandler(listCategoryProductsActivesController));

// router.delete('/:id', verifyTokenMiddleware, asyncHandler(deleteCategoryServiceController));
// router.put('/:id', verifyTokenMiddleware, asyncHandler(updateCategoryServiceController));

export { router }