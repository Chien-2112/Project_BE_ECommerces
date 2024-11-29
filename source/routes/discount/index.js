"use strict";

import express from "express";
import instanceDiscountController from "../../controllers/discount.controller.js";
import { validateToken } from "../../middlewares/validateToken.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.post("/amount", asyncHandler(instanceDiscountController.getDiscountAmount));
router.get("/list_product_code", asyncHandler(instanceDiscountController.getAllDiscountCodesWithProduct));

router.use(validateToken);

router.post("/", asyncHandler(instanceDiscountController.createDiscountCode));
router.get("/", asyncHandler(instanceDiscountController.getAllDiscountCodes));


export { router as discountRoute };