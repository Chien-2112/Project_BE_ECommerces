/**
 * Nhiệm vụ file server.js => Khai báo PORT & khởi động server.
 * => Kết nối với network NodeJS.
 */
"use strict";
import app from "./source/app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const PORT = process.env.PORT || 5000;
console.log("Current environment: ", process.env.NODE_ENV);

const server = app.listen(PORT, () => {
	console.log("----------------------------------------")
	console.log(`My WebServer is running on port ${PORT}`);
});

/**
 * Xử lý tín hiệu SIGINT - SIGNAL INTERRUPT.
 * => Một tín hiệu được đến process khi người dùng nhấn Ctrl + C trong terminal để dừng CT.
 * 
 * process.on('SIGINT', callback)
 * 	  - Lắng nghe tín hiệu SIGINT từ hệ thống.
 * 	  - Khi tín hiệu này được nhận, hàm callback được thực thi.
 * 
 * server.close() => Đóng server & log dòng chữ bên dưới để xác nhận server đã thoát.
 * 				  => Thoát process sau khi server đóng.
 */
process.on('SIGINT', () => {
	server.close( async () => {
		await mongoose.disconnect();
		console.log(`Disconnected DB!`);
		console.log(`Exit Server Express`);
		process.exit(0); // Thoát process sau khi server đóng.
	});
});