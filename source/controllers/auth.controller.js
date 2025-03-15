"use strict";
import { AuthService } from "../services/access/auth.service.js";
import {
	OK,
	CREATED
} from "../core/success.response.js";

class AuthController {
	signUp = async(request, response, next) => {
		console.log(`[P]::signUp::`, request.body);
		new CREATED({
			message: "Registered Successfully!",
			metadata: await AuthService.signUp(request.body),
		}).send(response);
	}

	signIn = async(request, response, next) => {
		console.log(`[P]::signIn::`, request.body);
		new OK({
			message: "Login successfully",
			metadata: await AuthService.signIn(request.body)
		}).send(response);
	}

	logOut = async(request, response, next) => {
		console.log(`[P]::logOut::`);
		new OK({
			message: "Logout successfully",
			metadata: await AuthService.logOut(request.keyToken)
		}).send(response);
	}

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
