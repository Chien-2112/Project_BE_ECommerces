"use strict";

import express from "express";
import instanceProductController from "../../controllers/product.controller.js";
import { validateToken } from "../../middlewares/validateToken.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.use(validateToken);
router.post("/", asyncHandler(instanceProductController.createProduct));

export { router as productRoute };