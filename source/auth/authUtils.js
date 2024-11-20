"use strict";
import jwt from "jsonwebtoken";

// GENERATE ACCESS TOKEN.
const generateAccessToken = ({ payload, privateKey }) => {
	return jwt.sign(payload, privateKey, {
		algorithm: 'RS256',
		expiresIn: "2 days"
	});
}

// GENERATE REFRESH TOKEN.
const generateRefreshToken = ({ payload, privateKey }) => {
	return jwt.sign(payload, privateKey, {
		algorithm: 'RS256',
		expiresIn: "7 days"
	});
}

const verifyToken = async (token, publicKey) => {
	try {
		return await jwt.verify(token, publicKey);
	} catch(err) {
		console.log("Error verify token: ", err);
	}
};

export { 
	generateAccessToken,
	generateRefreshToken,
	verifyToken,
}