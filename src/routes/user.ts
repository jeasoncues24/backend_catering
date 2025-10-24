import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { getUserController, deleteUserController, addUserController, updateUserController, listUsersAdminController } from "../controllers/user.controller";

const router = Router();

router.get('/', verifyTokenMiddleware, asyncHandler(getUserController));
router.delete('/:id',  verifyTokenMiddleware, asyncHandler(deleteUserController));
router.post('/', verifyTokenMiddleware, asyncHandler(addUserController));
router.put('/:id', verifyTokenMiddleware, asyncHandler(updateUserController));
router.get('/list/all', verifyTokenMiddleware, asyncHandler(listUsersAdminController));
export { router };