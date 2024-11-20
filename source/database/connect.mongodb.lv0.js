// LV_0 - CÁCH CONNECT DB CŨ.
"use strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectString = process.env.URL_MONGODB;

// CREATE FUNCTION - USING ASYNC-AWAIT + TRY...CATCH...
const connectDB = async() => {
	try {
		const connect = await mongoose.connect(connectString);
		console.log("Connected to MongoDB successed! ",
			connect.connection.host,
			connect.connection.name
		)
	} catch(err) {
		console.error(err);
		process.exit(1);
	}
}

// USING PROMISE.
// mongoose.connect(connectString)
// 	.then(() => { console.log(`Connected MongoDB Success`)})
// 	.catch((err) => console.log(`Error Connect!`))

export { connectDB };