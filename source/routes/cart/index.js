"use strict";

import express from "express";
import { validateToken } from "../../middlewares/validateToken.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { instanceCartController } from "../../controllers/cart.controller.js";

const router = express.Router();

router.use(validateToken);

router.post("/", asyncHandler(instanceCartController.addToCart));
router.delete("/", asyncHandler(instanceCartController.deleteCartItem));
router.get("/", asyncHandler(instanceCartController.getListProductCart));
router.post("/update", asyncHandler(instanceCartController.updateProductQuantity));

export { router as cartRoute };