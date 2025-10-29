import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { listCustomerController } from "../controllers/customer.controller";

const router = Router();

router.get('/:establishmentId', verifyTokenMiddleware, asyncHandler(listCustomerController))


export { router }