"use strict";

import { Types } from "mongoose";
import { KEYTOKEN } from "../../models/keytoken.model.js";

class KeyTokenService {
	static createKeyToken = async(
		{ userId, privateKey, publicKey, refreshToken }
	) => {
		try {
			/**
			 * Vì publicKey & privateKey đã ở dạng chuỗi PEM.
			 * => Nếu gọi toString("base64") sẽ gây lỗi.
			 */
			// const privateKeyString = privateKey.toString("base64");
			// const publicKeyString = publicKey.toString("base64");
	
			/**
			 * CÁCH 1 - DÙNG HÀM CREATE().
			 *  => Hàm create chỉ dùng để tạo mới một document trong MongoDB.
			 *     Nếu document đã tồn tại(có cùng userId) => Một bản ghi mới sẽ được thêm, gây khả năng trùng lặp DL.
			 * 
			 * KL => Chỉ cần dùng create() khi muốn tạo mới bản ghi. VD ghi user đăng ký tài khoản,...
			 * const tokens = await KEYTOKEN.create({
				* user_id: userId,
				* privateKey: privateKeyString,
				* publicKey: publicKeyString,
				* refreshTokenUsed: [],
				* refreshToken: refreshToken
			 * });
			*/
	
			/**
			 * CÁCH 2 - NÊN SỬ DỤNG FIND_ONE_AND_UPDATE.
			 *  Có 2 trường hợp xảy ra:
			 *   1 - Trong collection có document khớp với filter:
			 *     => MongoDB sẽ: - Cập nhật document đó với các trường từ update
			 * 					  - Và trả về document sau khi cập nhật nhờ new: true
			 * 
			 *   2 - Trong collection không có document nào khớp với filter:
			 *     => MongoDB sẽ: - Tạo 1 document mới với các trường từ filter và update, nhờ upsert: true
			 *     => Trả về document mới này.
			 * 
			 * 	 Ý nghĩa upsert: true - Nếu không muốn tạo mới document khi không tìm thấy, bỏ upsert: true khởi options.
			 *   KL => Hàm findOneAndUpdate với upsert: true vẫn hoạt động nếu không có document nào TM filter trong model.
			 */
			const filter = { user_id: userId };
			const update = {
				privateKey: privateKey,
				publicKey: publicKey,
				refreshTokenUsed: [],
				refreshToken: refreshToken
			}
			const options = { new: true, upsert: true };
			const tokens = await KEYTOKEN.findOneAndUpdate(filter, update, options);
	
			return tokens ? publicKeyString : null;
		} catch(err) {
			return err;
		}
	}

	static removeKeyById = async(id) => {
		if(!Types.ObjectId.isValid(id)) {
			throw new Error("Invalid ID Format");
		}
		return await KEYTOKEN.deleteOne({ user_id: id });
	} 

	static findByRefreshTokenUsed = async(refreshToken) => {
		return await KEYTOKEN.findOne({ refreshTokenUsed: [refreshToken] }).lean();
	}

	static findByRefreshToken = async(refreshToken) => {
		return await KEYTOKEN.findOne({ refreshToken }).lean();
	}

	static deleteKeyById = async(userId) => {
		return await KEYTOKEN.deleteOne({ user_id: userId });
	}

	static updateRefreshToken = async(userId, refreshToken, newRefreshToken) => {
		return await KEYTOKEN.updateOne(
			{ user_id: userId },
			{
				$set: { refreshToken: newRefreshToken },
				$addToSet: { refreshTokenUsed: refreshToken }
			}
		);
	}
}

export { KeyTokenService };