"use strict";
import express from "express";
import instanceAuthController from "../../controllers/auth.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { validateToken } from "../../middlewares/validateToken.js";

const router = express.Router();

router.post("/shop/signup", asyncHandler(instanceAuthController.signUp));
router.post("/shop/signin", asyncHandler(instanceAuthController.signIn));

router.use(validateToken);
router.post("/shop/logout", asyncHandler(instanceAuthController.logOut));
router.post("/shop/handlerRefreshToken", asyncHandler(instanceAuthController.refreshToken));


export { router as authRoute };