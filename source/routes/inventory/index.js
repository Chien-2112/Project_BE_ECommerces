"use strict";

import express from "express";
import { instanceInventoryController } from "../../controllers/inventory.controller.js";
import { validateToken } from "../../middlewares/validateToken.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.use(validateToken);

router.post("/", asyncHandler(instanceInventoryController.addStockToInventory));

export { router as InventoryRoute };