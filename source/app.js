"use strict";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

import { indexRoute } from "./routes/index.js";

const app = express();

// INIT MIDDLEWARE.
app.use(morgan("dev")); // Dùng trong môi trường development.
// app.use(morgan("combined")); // Dùng trong môi trường production

app.use(helmet());
app.use(compression()); // Giảm tải khối lượng DL truyền đi.
app.use(
	cors({
		origin: "http://localhost:5001",
		credentials: true
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// INIT DATABASE.
import instanceDB from "./database/connect.mongodb.js";
import { checkOverload } from "./helpers/check.connect.js";
// checkOverload();

// INIT ROUTES.
app.use("", indexRoute);

// app.get("/", (request, response) => {
// 	const str = "Hello FantipJS";
// 	return response.status(200).json({
// 		msg: "Welcome Fantipjs",
// 		strRepeat: str.repeat(10000)
// 	});
// });

// HANDLING ERROR.
app.use((request, response, next) => {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
});

app.use((err, request, response, next) => {
	const statusCode = err.status || 500;
	return response.status(statusCode).json({
		status: "error",
		code: statusCode,
		stack: err.stack,
		message: err.message || "Internal Server Error"
	})
});

export default app;