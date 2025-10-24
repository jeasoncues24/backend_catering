import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { getCompanyController, updateCompanyController, listAllCompaniesController } from "../controllers/company.controller";

const router = Router();

router.get('/:id', verifyTokenMiddleware, asyncHandler(getCompanyController));
router.put('/:id', verifyTokenMiddleware, asyncHandler(updateCompanyController));
router.get('/list/all', verifyTokenMiddleware, asyncHandler(listAllCompaniesController));

export { router };