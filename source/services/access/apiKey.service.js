"use strict";

import { APIKEY } from "../../models/apiKey.model.js";
import crypto from "crypto";

const findById = async(key) => {
	// const newKey = await APIKEY.create({
	// 	key: crypto.randomBytes(64).toString("hex"),
	// 	permissions: ['0000']
	// });
	// console.log(newKey);
	const objKey = await APIKEY.findOne({ key, status: true }).lean();
	return objKey;
}

export { findById };