"use strict";

import jwt from "jsonwebtoken";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { HEADER } from "../../constanst.js";
import { 
	BadRequestError, 
	NotFoundError, 
	UnauthorizedRequestError
} from "../core/error.response.js";
import { KEYTOKEN } from "../models/keytoken.model.js";
import { verifyToken } from "../auth/authUtils.js";

const validateToken = asyncHandler(async(request, response, next) => {
	let token;
	const userId = request.headers[HEADER.CLIENT_ID];
	if(!userId) {
		throw new UnauthorizedRequestError(
			"You don't have ID to authenticated!"
		);
	}
	const keyToken = await KEYTOKEN.findOne({ user_id: userId });
	if(!keyToken) {
		throw new NotFoundError("Key Token not found");
	}
	const { publicKey } = keyToken;

	const refreshToken = request.headers[HEADER.REFRESHTOKEN];
	if(refreshToken) {
		try {
			const decodedUser = jwt.verify(refreshToken, publicKey);
			if(userId !== decodedUser.user.userId) throw new UnauthorizedRequestError("Invalid UserId");
			request.keyToken = keyToken;
			console.log(`[1]::`, request.keyToken);
			request.user = decodedUser;
			console.log(`[2]::`, request.user);
			request.refreshToken = refreshToken;
			console.log(`[3]::`, request.refreshToken);
			return next();
		} catch(err) {
			throw err;
		}
	}

	const authHeader = request.headers[HEADER.AUTHORIZATION] || request.headers.authorization;
	if(authHeader && authHeader.startsWith("Bearer")) {
		token = authHeader.split(" ")[1];
		try {
			const decodedUser = jwt.verify(token, publicKey);
			console.log(`Decoded user: ${decodedUser}`);
			if(userId !== decodedUser.userId) throw new UnauthorizedRequestError("Invalid UserId");
			request.keyToken = keyToken;
			return next();
		} catch(err) {
			throw err;
		}
	} else {
		throw new UnauthorizedRequestError(
			"You're not authorized to access this route"
		);
	}
});

export { validateToken };