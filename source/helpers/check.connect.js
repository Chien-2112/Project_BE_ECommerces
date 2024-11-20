"use strict";
import os from "node:os";
import process from "node:process";
import mongoose from "mongoose";

/**
 * Các thông số => Theo quy ước mặc định, phải khai báo bằng 1 const.
 * => Nguyên tắc lập trình - Không được nhúng các thông số đó trực tiếp vào code.
*/
const _SECONDS = 5000;

// Kiểm tra hệ thống có bao nhiêu Connect.
const countConnect = () => {
	const numConnection = mongoose.connections.length;
	console.log(`Number of connections:: ${numConnection}`);
}

// Thông báo khi server quá tải Connect.
const checkOverload = () => {
	// Monitor every 5 seconds.
	setInterval(() => {
		const numConnections = mongoose.connections.length;
		console.log(`Number of connection:: ${numConnections}`);
		const numCores = os.cpus().length;
		console.log(`Number of cores:: ${numCores}`); // 12
		const memoryUsage = process.memoryUsage().rss;

		// Maximum number of connections.
		// Giả sử mỗi core chịu đựng được 5 connect.
		const maxConnections = numCores * 5;

		console.log(`Active connections:: ${numConnections}`);
		console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

		if(numConnections > maxConnections) {
			console.log(`Connection overload detected!`);
		}
	}, _SECONDS);
}

export { countConnect, checkOverload };