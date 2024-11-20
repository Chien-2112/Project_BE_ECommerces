/**
 * KEY TOKEN - Nhiệm vụ lưu lại: userId, privateKey, publicKey, 
 * 			   refreshToken, mảng chứa các refreshToken đã sử dụng.
 */
"use strict";

import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

const keyTokenSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Shop"
	},
	privateKey: {
		type: String,
		required: true
	},
	publicKey: {
		type: String,
		required: true
	},
	refreshTokenUsed: {
		type: Array,
		default: []
	},
	refreshToken: {
		type: String,
		required: true,
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
});

const KEYTOKEN = model(DOCUMENT_NAME, keyTokenSchema);
export { KEYTOKEN };