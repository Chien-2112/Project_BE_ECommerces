"use strict";

import { CartService } from "../services/product/cart.service.js";
import { SuccessResponse } from "../core/success.response.js";

class CartController {
	// ADD TO CART
	addToCart = async(request, response, next) => {
		new SuccessResponse({
			message: "Create new Cart successfully!",
			metadata: await CartService.addProductToCart(request.body)
		}).send(response);
	}

	// UPDATE PRODUCT QUANTITY.
	updateProductQuantity = async(request, response, next) => {
		new SuccessResponse({
			message: "Update Product Quantity successfully!",
			metadata: await CartService.addOrRemoveProductToCart(request.body)
		}).send(response);
	}

	// DELETE CART ITEM.
	deleteCartItem = async(request, response, next) => {
		new SuccessResponse({
			message: "Delete Cart Item successfully!",
			metadata: await CartService.deleteUserCartItem(request.body)
		}).send(response);
	}

	// GET LIST PRODUCT CART.
	getListProductCart = async(request, response, next) => {
		new SuccessResponse({
			message: "Get List Product Cart successfully!",
			metadata: await CartService.getListProductCart(request.query)
		}).send(response);
	}
}

const instanceCartController = new CartController();
export { instanceCartController };