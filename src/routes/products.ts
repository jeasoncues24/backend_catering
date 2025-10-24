import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { addProductController, getProductsListController } from "../controllers/product.controller";


const router = Router();

router.post('/', verifyTokenMiddleware, asyncHandler(addProductController));
router.get('/:establishment_id', verifyTokenMiddleware, asyncHandler(getProductsListController));

export { router }