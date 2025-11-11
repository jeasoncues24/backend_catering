import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addCategoryProductController, deleteCategoryProductController, listCategoryProductController, listCategoryProductsActivesController, updateCategoryProductController } from "../controllers/categoryproducts.controller";

const router = Router();

router.post('/',  verifyTokenMiddleware, asyncHandler(addCategoryProductController));
router.get('/:establishment_id', verifyTokenMiddleware, asyncHandler(listCategoryProductController));
router.get('/actives/:establishment_id', asyncHandler(listCategoryProductsActivesController));

router.delete('/:id', verifyTokenMiddleware, asyncHandler(deleteCategoryProductController));
router.put('/:id', verifyTokenMiddleware, asyncHandler(updateCategoryProductController));

export { router }