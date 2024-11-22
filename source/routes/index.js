"use strict";
import express from "express";
import { authRoute } from "./access/auth.js";
import { apiKey, permission } from "../middlewares/validateApiKey.js";
import { productRoute } from "./product/index.js";

const router = express.Router();

// Check apiKey.
router.use(apiKey);
// Check permissions.
router.use(permission('0000'));

router.use("/v1/api/", authRoute);
router.use("/v1/api/product", productRoute);

export { router as indexRoute };