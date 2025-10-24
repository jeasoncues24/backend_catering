import { Router } from "express";
import { verifyTokenMiddleware } from "../utils/jwt.handle";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteBranchController, getBranchesForCompanyControllers, updateBranchController, getEstablishmentController, addBranchController, getInformationForBranchController, getStatusForBranchController, updateStatusForBranchController } from "../controllers/branches.controller"


const router = Router();

router.post("/company", verifyTokenMiddleware, asyncHandler(getBranchesForCompanyControllers));
router.put("/:id", verifyTokenMiddleware, asyncHandler(updateBranchController));
router.delete("/:id", verifyTokenMiddleware, asyncHandler(deleteBranchController));
router.get("/:id", verifyTokenMiddleware, asyncHandler(getEstablishmentController));
router.post("/", verifyTokenMiddleware, asyncHandler(addBranchController));
router.get("/information/:tradename/:branch", asyncHandler(getInformationForBranchController));
router.get("/status/:establishment_id", asyncHandler(getStatusForBranchController));
router.put("/update-status/:establishment_id", asyncHandler(updateStatusForBranchController));


export { router };