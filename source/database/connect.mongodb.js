// LV_1 - CÁCH CONNECT DB MỚI.
"use strict";
import mongoose from "mongoose";
import { countConnect } from "../helpers/check.connect.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * LV_0 - Config MongoDB trong configs.
 * const { db: { host, name, port } } = config;
 * const connectString = `mongodb://${host}:${port}/${name}`
*/

/**
 * Cấu hình biến môi trường trong file .env
 */
const connectString = process.env.URL_MONGODB;

// USING SINGLETON - DESIGN PATTERN.
class Database {
	constructor() {
		this.connectDB();
	}

	// ConnectDB.
	connectDB(type = "mongodb") {
		/**
		 * mongoose.set("debug", true);
		 * => Kích hoạt chế độ debug trong Mongoose.
		 * => Nhằm ghi log chi tiết về các câu lệnh MongoDB được thực hiện qua Mongoose.
		 * => Để theo dõi & kiểm tra các truy vấn.
		 * 
		 * mongoose.set("debug", { color: true });
		 * => Bật chế độ debug với color trong log.
		 * => Các thành phần trong truy vấn sẽ được hiển thị các màu khác nhau để dễ phân biệt.
		 * 
		 * Điều kiện: 1 === 1 là giả dụ - Sau này có thể thay đổi thành processe.env.NODE_ENV === "development".
		 *
		 * => Thông thường, chế độ debug chỉ nên được bật trong môi trường development.
		 * => Không nên bật trong môi trường production để tránh lộ thông tin nhạy cảm về DB.
		 */
		if(process.env.NODE_ENV === 'development') {
			mongoose.set("debug", true);
			mongoose.set("debug", { color: true });
		}
		mongoose.connect(connectString, {
			maxPoolSize: 50
		})
			.then(() => {
				console.log(`Connected MongoDB Success!`);
				countConnect();
			})
			.catch((err) => console.log(`Error Connect: `, err))
	}
	static getInstance() {
		if(!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const instanceDB = Database.getInstance();

export default instanceDB;
