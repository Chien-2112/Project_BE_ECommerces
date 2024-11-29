"use strict";

import { CheckoutService } from "../services/product/checkout.service.js";
import { SuccessResponse } from "../core/success.response.js";

class CheckoutController {
	// CHECKOUT REVIEW.
	checkoutReview = async(request, response, next) => {
		new SuccessResponse({
			message: "Checkout Review",
			metadata: await CheckoutService.CheckoutReview(request.body)
		}).send(response);
	}

	// ORDER BY USER.
	orderByUser = async(request, response, next) => {
		new SuccessResponse({
			message: "Order successfully",
			metadata: await CheckoutService.orderByUser(request.body)
		}).send(response);
	}

	// GET ORDERS BY USER.
	getOrdersByUser = async(request, response, next) => {
		new SuccessResponse({
			message: "Get Orders successfully",
			metadata: await CheckoutService.getOrdersByUser({
				...request.query
			})
		}).send(response);
	}
	
	// GET ONE ORDERS BY USER.
	getOneOrdersByUser = async(request, response, next) => {
		new SuccessResponse({
			message: "Get One Order successfully",
			metadata: await CheckoutService.getOneOrderByUser({
				...request.query
			})
		}).send(response);
	}

	// CANCEL ORDER.
	cancelOrderByUser = async(request, response, next) => {
		new SuccessResponse({
			message: "Cancel Order successfully",
			metadata: await CheckoutService.cancelOrderByUser({
				...request.query
			})
		}).send(response);
	}
}

const instanceCheckoutController = new CheckoutController();
export { instanceCheckoutController };