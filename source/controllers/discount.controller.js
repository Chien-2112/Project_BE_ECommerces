"use strict";

import { DiscountService } from "../services/product/discount.service.js";
import { SuccessResponse } from "../core/success.response.js";

class DiscountController {
	// CREATE NEW DISCOUNT CODE.
	createDiscountCode = async(request, response, next) => {
		new SuccessResponse({
			message: "Create Discount Code successfully",
			metadata: await DiscountService.createDiscountCode({
				...request.body,
				shopId: request.user.userId
			})
		}).send(response);
	}

	// GET ALL DISCOUNT CODE WITH PRODUCT.
	getAllDiscountCodes = async(request, response, next) => {
		new SuccessResponse({
			message: "Get All Discount Codes successfully",
			metadata: await DiscountService.getAllDiscountCodesByShop({
				...request.query,
				shopId: request.user.userId
			})
		}).send(response);
	}

	// GET DISCOUNT AMOUNT.
	getDiscountAmount = async(request, response, next) => {
		new SuccessResponse({
			message: "Get Discount Amount successfully",
			metadata: await DiscountService.getDiscountAmount({
				...request.body
			})
		}).send(response);
	}

	// GET ALL DISCOUNT CODES WITH PRODUCT.
	getAllDiscountCodesWithProduct = async(request, response, next) => {
		new SuccessResponse({
			message: "Get All Discount Codes With Product successfully!",
			metadata: await DiscountService.getAllDiscountCodesWithProduct({
				...request.query,
				shopId: request.user.userId
			})
		}).send(response);
	}
}

const instanceDiscountController = new DiscountController();
export default instanceDiscountController;