import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addCategoryServiceController, deleteCategoryServiceController, listCategoriesActivesController, listCategoryServiceController, updateCategoryServiceController } from "../controllers/categoryservice.controller";

const router = Router();

router.post('/',  verifyTokenMiddleware, asyncHandler(addCategoryServiceController));
router.get('/:establishment_id', verifyTokenMiddleware, asyncHandler(listCategoryServiceController));
router.delete('/:id', verifyTokenMiddleware, asyncHandler(deleteCategoryServiceController));
router.put('/:id', verifyTokenMiddleware, asyncHandler(updateCategoryServiceController));
router.get('/actives/:establishment_id', asyncHandler(listCategoriesActivesController));

export { router }; 