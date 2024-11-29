"use strict";
import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema({
	// ID của người dùng đặt hàng.
	order_userId: {
		type: Number,
		required: true
	},
	/**
	 * Đơn hàng thanh toán - Tương ứng với checkout_order bên service checkout.
	 * Format: 
	 *     order_checkout = {
	 * 		   totalPrice,
	 * 		   totalApplyDiscount,
	 *         feeShip
	 *     }
	 */
	order_checkout: {
		type: Object,
		default: {}
	},
	/**
	 * Thông tin của đơn hàng.
	 * Format:  
	 *     order_shipping: {
	 * 		   street, city, state, country 
	 *     }
	*/
	order_shipping: {
		type: Object,
		Number: {}
	},
	order_payment: {
		type: Object,
		default: {}
	},
	order_products: {
		type: Array,
		required: true
	},
	order_trackingNumber: {
		type: String,
		default: '#0000120052024' // #00001 - 20/05/2024
	},
	/**
	 * Trạng thái của đơn hàng:
	 *  - pending: Đơn hàng đã được tạo nhưng chưa được xử lý.
	 *  - confirmed: Đơn hàng đã được xác nhận bởi người bán.
	 *  - shipped: Đơn hàng đang được vận chuyển đến người dùng.
	 *  - cancelled: Đơn hàng bị hủy bỏ bởi người mua or người bán.
	 * 
	 * Lưu ý: Nếu đơn hàng đã ở trạng thái: shipped => Không được phép cancelled.
	 */
	order_status: {
		type: String,
		enum: ["pending", "confirmed", "shipped", "cancelled"],
		default: "pending"
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
});

const ORDER = model(DOCUMENT_NAME, orderSchema);
export { ORDER };