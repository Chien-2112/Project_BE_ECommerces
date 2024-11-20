"use strict";
import { AuthService } from "../services/access/auth.service.js";
import {
	OK,
	CREATED
} from "../core/success.response.js";

// Có 2 kiểu viết - Một là viết bằng ES5, hai là ES6.
class AuthController {
	// SINGUP.
	signUp = async(request, response, next) => {
		console.log(`[P]::signUp::`, request.body);
		new CREATED({
			message: "Registered Successfully!",
			metadata: await AuthService.signUp(request.body),
		}).send(response);
	}

	// SIGNIN.
	signIn = async(request, response, next) => {
		console.log(`[P]::signIn::`, request.body);
		new OK({
			message: "Login successfully",
			metadata: await AuthService.signIn(request.body)
		}).send(response);
	}

	// LOGOUT.
	logOut = async(request, response, next) => {
		console.log(`[P]::logOut::`);
		new OK({
			message: "Logout successfully",
			metadata: await AuthService.logOut(request.keyToken)
		}).send(response);
	}

	// REFRESH TOKEN.
	refreshToken = async(request, response, next) => {
		console.log(`[P]::refreshToken::`);
		new OK({
			message: "Get Token successfully!",
			metadata: await AuthService.handlerRefreshToken({
				keyToken: request.keyToken,
				user: request.user,
				refreshToken: request.refreshToken
			})
		}).send(response);
	}
}

const instanceAuthController = new AuthController();
export default instanceAuthController;