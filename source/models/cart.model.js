"use strict";
import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const cartSchema = new Schema({
	// Trạng thái của giỏ hàng.
	cart_state: {
		type: String,
		required: true,
		enum: ["active", "completed", "failed", "pending"],
		default: "active"
	},
	/**
	 * Product trong giỏ hàng: 
	 *   {
	 * 	 	productId, shopId, quantity, name, price
	 *   }
	 */
	cart_products: {
		type: Array,
		required: true,
		default: []
	},
	cart_count_product: {
		type: Number,
		default: 0
	},
	cart_userId: {
		type: Number,
		required: true
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
});

const CART = model(DOCUMENT_NAME, cartSchema);
export { CART };