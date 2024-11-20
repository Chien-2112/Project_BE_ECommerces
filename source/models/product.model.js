"use strict";

import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// DEFINED CÁC THUỘC TÍNH CHUNG CHO TẤT CẢ SẢN PHẨM.
const productSchema = new Schema({
	product_name: {
		type: String,
		required: true,
	},
	product_thumb: {
		type: String,
		required: true
	},
	product_description: {
		type: String
	},
	product_slug: {
		type: String
	},
	product_price: {
		type: Number,
		required: true
	},
	product_quantity: {
		type: Number,
		required: true
	},
	// Các loại mặt hàng.
	product_type: {
		type: String,
		required: true,
		enum: ["Electronic", "Clothing", "Furniture"]
	},
	product_shop: {
		type: Schema.Types.ObjectId,
		ref: "Shop"
	},
	product_attributes: {
		type: Schema.Types.Mixed,
		required: true
	}
	// MORE.
}, {
	/**
	 * Xác định tên của collection trong MongoDB sẽ lưu trữ documents.
	 * => Nếu không cung cấp fields này - MongoDB sẽ tự động đặt tên collection.
	 * bằng cách chuyển đổi tên model sang số nhiều.
	 */
	collection: COLLECTION_NAME,
	/**
	 * Tự động thêm 2 fields: createdAt & UpdatedAt vào mỗi document.
	 * => Lưu thời điểm tài liệu được tạo và cập nhật lần cuối.
	 */
	timestamps: true
});

// DEFINED THE PRODUCT TYPE = CLOTHING.
const clothingSchema = new Schema({
	brand: {
		type: String, required: true
	},
	size: {
		type: String, required: true
	},
	material: {
		type: String, required: true
	},
	product_shop: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Shop"
	}
}, {
	collection: "Clothes",
	timestamps: true
});

// DEFINED THE PRODUCT TYPE = CLOTHING.
const electronicSchema = new Schema({
	manufacturer: {
		type: String, required: true
	},
	model: {
		type: String, required: true
	},
	color: {
		type: String, required: true
	},
	product_shop: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Shop"
	}
}, {
	collection: "Electronics",
	timestamps: true
});

// DEFINED THE PRODUCT TYPE = FURNITURE..
const furnitureSchema = new Schema({
	brand: {
		type: String, required: true
	},
	size: {
		type: String, required: true
	},
	material: {
		type: String, required: true
	},
	product_shop: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Shop"
	}
}, {
	collection: "Furnitures",
	timestamps: true
});

const PRODUCT = model(DOCUMENT_NAME, productSchema);
const CLOTHING = model("Clothing", clothingSchema);
const ELECTRONIC = model("Electronic", electronicSchema);
const FURNITURE = model("Furniture", furnitureSchema);

export { PRODUCT, CLOTHING, ELECTRONIC, FURNITURE };