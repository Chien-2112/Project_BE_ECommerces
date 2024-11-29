"use strict";

import express from "express";
import { authRoute } from "./access/auth.js";
import { apiKey, permission } from "../middlewares/validateApiKey.js";
import { productRoute } from "./product/index.js";
import { discountRoute } from "./discount/index.js";
import { cartRoute } from "./cart/index.js";
import { checkoutRoute } from "./checkout/index.js";
import { InventoryRoute } from "./inventory/index.js";

const router = express.Router();

// Check apiKey.
router.use(apiKey);
// Check permissions.
router.use(permission('0000'));

router.use("/v1/api/product", productRoute);
router.use("/v1/api/", authRoute);
router.use("/v1/api/discount", discountRoute);
router.use("/v1/api/cart", cartRoute);
router.use("/v1/api/checkout", checkoutRoute);
router.use("/v1/api/inventory", InventoryRoute);

export { router as indexRoute };