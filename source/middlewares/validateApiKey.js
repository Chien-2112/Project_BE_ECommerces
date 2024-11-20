"use strict";

import { HEADER } from "../../constanst.js";
import { 
	BadRequestError,
	NotFoundError, 
	UnauthorizedRequestError 
} from "../core/error.response.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { findById } from "../services/access/apiKey.service.js";

// CHECK API KEY.
const apiKey = asyncHandler(async (request, response, next) => {
	const key = request.headers[HEADER.API_KEY]?.toString();
	// APIKey không tồn tại.
	if(!key) {
		throw new UnauthorizedRequestError(
			"You're not authorized to access all API request"
		);
	}
	// APIKey có tồn tại => Check tính hợp lệ.
	const objKey = await findById(key);
	if(!objKey) {
		throw new NotFoundError(
			"API Key not found"
		);
	}
	request.objKey = objKey;
	next();
});

// CHECK PERMISSIONS.
const permission = (permission) => {
	return (request, response, next) => {
		if(!request.objKey.permissions) {
			throw new UnauthorizedRequestError(
				"You're not permitted to access"
			);
		}
		console.log("Permissions::", request.objKey.permissions);
		const validPermission = request.objKey.permissions.includes(permission);
		if(!validPermission) {
			throw new BadRequestError(
				"Permission denied"
			);
		}
		next();
	}
}

export { apiKey, permission };