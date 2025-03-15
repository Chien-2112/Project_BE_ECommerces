// LV_1 - CÁCH CONNECT DB MỚI.
"use strict";
import mongoose from "mongoose";
import { countConnect } from "../helpers/check.connect.js";
import dotenv from "dotenv";
dotenv.config();

const connectString = process.env.URL_MONGODB;

// USING SINGLETON - DESIGN PATTERN.
class Database {
	constructor() {
		this.connectDB();
	}
	
	connectDB(type = "mongodb") {
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
