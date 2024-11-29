"use strict";

import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const discountSchema = new Schema({
	/**
	 * Tên chương trình giảm giá.
	 * => Tên Voucher sẽ không được hiển thị cho Người mua.
	 */
	discount_name: {
		type: String,
		required: true
	},
	discount_description: {
		type: String,
		required: true,
	},
	/**
	 * Loại giảm giá/Mức giảm.
	 * => Có 2 loại: Giảm theo số tiền hoặc theo phần trăm.
	 */
	discount_type: {
		type: String,
		enum: ['fixed_amount', "percentage"],
		default: "fixed_amount"
	},
	// Giá trị giảm giá.
	discount_value: {
		type: Number,
		required: true
	},
	// Mã voucher.
	discount_code: {
		type: String,
		required: true
	},
	// Thời gian sử dụng.
	discount_start_date: {
		type: Date,
		required: true
	},
	discount_end_date: {
		type: Date,
		required: true
	},
	/**
	 * Tổng lượt sử dụng tối đa.
	 * => Là tổng số voucher có thể được sử dụng trên toàn bộ nền tảng hoặc trong 1 cửa hàng cụ thể.
	 * 
	 * VD: Nếu tổng lượt sử dụng tối đa là 1000, khi 1000 người dùng đầu tiên đã sử dụng voucher
	 *    => Sẽ không còn khả dụng nữa, ngay cả khi vẫn còn trong thời hạn sử dụng.
	 */
	discount_max_uses: {
		type: Number,
		required: true
	},
	/**
	 * Tổng số lần voucher đã được sử dụng
	 */
	discount_uses_count: {
		type: Number,
		required: true
	},
	/**
	 * Danh sách những người mua đã sử dụng voucher.
	 */
	discount_users_used: {
		type: Array,
		default: []
	},
	/**
	 * Lượt sử dụng tối đa / Người mua.
	 * => Là số lần có thể áp dụng voucher trong thời gian voucher còn hiệu lực.
	 *   => Giới hạn riêng biệt cho từng TK người mua,
	 *   => Nhằm đảm bảo công bằng & ngăn chặn việc 1 người lạm dụng voucher quá nhiều lần.
	 */
	discount_max_uses_per_user: {
		type: Number,
		required: true
	},
	/**
	 * Giá trị đơn hàng tối thiểu.
	 * => Là mức giá thấp nhất mà tổng giá trị của đơn hàng phải đạt để có thể áp dụng 1 mã voucher.
	 */
	discount_min_order_value: {
		type: Number,
		required: true
	},
	discount_shopId: {
		type: Schema.Types.ObjectId,
		ref: "Shop"
	},
	discount_is_active: {
		type: Boolean,
		default: true 
	},
	// Voucher áp dụng cho toàn ngành hàng hay 1 mặt hàng cụ thể.
	discount_applies_to: {
		type: String,
		required: true,
		enum: ["all", "specific"]
	},
	// Những sản phẩm được áp dụng.
	discount_product_ids: {
		type: Array,
		default: []
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
});

const DISCOUNT = model(DOCUMENT_NAME, discountSchema);
export { DISCOUNT };