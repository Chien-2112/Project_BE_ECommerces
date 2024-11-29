"use strict";

import express from "express";
import instanceProductController from "../../controllers/product.controller.js";
import { validateToken } from "../../middlewares/validateToken.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

// SEARCH PRODUCT BY USER
router.get("/search/:keySearch", asyncHandler(instanceProductController.getListSearchProduct));
// FIND ALL PRODUCTS BY USER.
router.get("", asyncHandler(instanceProductController.findAllProducts));
router.get("/:productId", asyncHandler(instanceProductController.findProductById));

router.use(validateToken);

// BY USER
router.get("/drafts/all", asyncHandler(instanceProductController.getAllDraftsForShop));
router.get("/published/all", asyncHandler(instanceProductController.getAllPublishForShop));

// QUERY BY SHOP.
router.post("/", asyncHandler(instanceProductController.createProduct));
router.patch("/:productId", asyncHandler(instanceProductController.updateProductById));
router.post("/published/:id", asyncHandler(instanceProductController.publishProductByShop));
router.post("/unpublished/:id", asyncHandler(instanceProductController.unPublishProductByShop))

export { router as productRoute };