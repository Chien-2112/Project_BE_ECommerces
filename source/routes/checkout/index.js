"use strict";

import express from "express";
import { instanceCheckoutController } from "../../controllers/checkout.controller.js";
import { validateToken } from "../../middlewares/validateToken.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.use(validateToken);
router.post("/review", asyncHandler(instanceCheckoutController.checkoutReview));
router.post("/", asyncHandler(instanceCheckoutController.orderByUser));
router.get("/", asyncHandler(instanceCheckoutController.getOrdersByUser));
router.get("/orderId", asyncHandler(instanceCheckoutController.getOneOrdersByUser));
router.patch("/orderId", asyncHandler(instanceCheckoutController.cancelOrderByUser));

export { router as checkoutRoute };