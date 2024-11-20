"use strict";
import { SHOP } from "../../models/shop.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { 
	generateAccessToken, 
	generateRefreshToken,
	verifyToken 
} from "../../auth/authUtils.js";
import { KeyTokenService } from "./keyToken.service.js";
import { getInfoData } from "../../utils/index.js";
import { ROLE } from "../../../constanst.js";
import { 
	BadRequestError,
	ConflictRequestError,
	UnauthorizedRequestError,
	NotFoundError
} from "../../core/error.response.js";
import { KEYTOKEN } from "../../models/keytoken.model.js";

const SALT_ROUND = 10;

class AuthService {
	// SIGNUP SERVICE.
	static signUp = async({ name, email, password }) => {
		// Check email.
		const availabelShop = await SHOP.findOne({ email }).lean();
		if(availabelShop) {
			throw new BadRequestError("Error: Shop already registered!");
		}
		const salt = await bcrypt.genSalt(SALT_ROUND);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newShop = await SHOP.create({
			name, email, password: hashedPassword,
			roles: [ROLE.SHOP]
		});
		if(newShop) {
			const { _id: userId, email } = newShop;
			// User register => Được truy cập luôn vào hệ thống.
			// => Không cần redirect qua trang login.
			const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
				modulusLength: 4096,
				publicKeyEncoding: { type: "pkcs1", format: "pem" },
				privateKeyEncoding: { type: "pkcs1", format: "pem" }
			});
			// RETURN: PublicKey + PrivateKey dạng chuỗi PEM.
			console.log({ privateKey, publicKey });

			const accessToken = generateAccessToken({
				payload: {
					user: { userId, email }
				},
				privateKey
			});
			const refreshToken = generateRefreshToken({
				payload: {
					user: { userId, email }
				},
				privateKey
			});

			await KeyTokenService.createKeyToken({
				userId, privateKey, publicKey, refreshToken
			});

			// response.cookie("refreshtoken", refreshToken, {
			// 	httpOnly: true,
			// 	maxAge: 72 * 60 * 60 * 1000,
			// 	secure: false,
			// 	path: "/",
			// 	sameSite: "strict"
			// });
			return {
				newShop: getInfoData({ 
					fields: ['_id', 'name', 'email'], 
					object: newShop 
				}),
				accessToken, refreshToken
			};
		}
	}

	// SIGNIN SERVICE.
	static signIn = async({ email, password }) => {
		const foundShop = await SHOP.findOne({ email }).lean();
		const validPassword = await bcrypt.compare(
			password, foundShop.password
		);
		if(foundShop && validPassword) {
			const { _id: userId, email } = foundShop;

			/**
			 * Mỗi lần người dùng đăng nhập, không nên tạo lại cặp khóa RSA mới.
			 *  => Điều này có thể gây ra:
			 *    +. Hiệu suất kém: Việc sinh cặp khóa 4096-bit rất tồn thời gian.
			 *    +. Lãng phí bộ nhớ: Cặp khóa mới liên tục được lưu trữ vào database.
			 *  => Cải thiện:
			 *    +. Sinh cặp khóa RSA 1 lần duy nhất khi tạo tài khoản thay vì mỗi lần đăng nhập.
			 *    +. Trong lần login => Chỉ cần lấy key RSA từ DB.
			 * 
			 *  => Trong trường hợp này vẫn cần vì khi refreshToken, nếu lỗi => Yêu cầu người dùng relogin.
			*/

			const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
				modulusLength: 4096,
				privateKeyEncoding: { type: "pkcs1", format: "pem" },
				publicKeyEncoding: { type: "pkcs1", format: "pem" }
			});

			// const foundKey = await KEYTOKEN.findOne({ user_id: userId });
			// const { publicKey, privateKey } = foundKey;

			// GENERATE ACCESS TOKEN.
			const accessToken = generateAccessToken({
				payload: {
					user: { userId, email }
				},
				privateKey
			});
			// GENERATE REFRESH TOKEN.
			const refreshToken = generateRefreshToken({
				payload: {
					user: { userId, email }
				},
				privateKey
			});
			console.log({ accessToken, refreshToken });

			// LƯU KEY + REFRESH TOKEN VÀO DB.
			await KeyTokenService.createKeyToken({
				userId, privateKey, publicKey, refreshToken
			});

			// SAVE REFRESH TOKEN INTO HTTPONLY COOKIE.
			// response.cookie("refreshtoken", refreshToken, {
			// 	httpOnly: true,
			// 	maxAge: 72 * 60 * 60 * 1000, // 72 giờ.
			// 	secure: true, // process.env.NODE_ENV === "production"
			// 	path: "/",
			// 	sameSite: "strict" // Ngăn chặn tấn công CSRF.
			// });

			return { accessToken };
		} else {
			throw new UnauthorizedRequestError(
				"Email or Password not matched!"
			);
		}

	}

	// LOGOUT SERVICE.
	static logOut = async({ userId }) => {
		console.log(userId);
		const deleteKey = await KeyTokenService.removeKeyById(userId);
		return deleteKey;
	}

	// REFRESH TOKEN SERVICE.
	static handlerRefreshToken = async({ keyToken, user, refreshToken }) => {
		const { user: {userId, email} } = user;

		if(keyToken.refreshTokenUsed.includes(refreshToken)) {
			await KeyTokenService.deleteKeyById(userId);
			throw new BadRequestError("Something wrong happend !! Please relogin!");
		}

		if(keyToken.refreshToken !== refreshToken) {
			throw new UnauthorizedRequestError("Shop not registered");
		}

		// RefreshToken chưa được sử dụng.
		const { privateKey, publicKey } = keyToken;

		// Generate AT + RT mới.
		const newAccessToken = generateAccessToken({ payload: { user: { userId, email }}, privateKey});
		const newRefreshToken = generateRefreshToken({ payload: { user: { userId, email }}, privateKey});

		// Update DB.
		await KeyTokenService.updateRefreshToken(userId, refreshToken, newRefreshToken);
		return { newAccessToken }
	}
}

export { AuthService };