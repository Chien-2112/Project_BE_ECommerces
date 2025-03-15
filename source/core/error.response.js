"use strict";

const StatusCode = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	CONFLICT: 409,
	NOTFOUND: 404
}

const ReasonStatusCode = {
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden error',
	CONFLICT: "Conflict Error",
	NOTFOUND: "Not Found",
	BAD_REQUEST: "Bad Request"
}

class ErrorResponse extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}

class ConflictRequestError extends ErrorResponse {
	constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT) {
		super(message, statusCode);
	}
}

class ForBiddenError extends ErrorResponse {
	constructor(message = ReasonStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
		super(message, statusCode);
	}
}

class UnauthorizedRequestError extends ErrorResponse {
	constructor(message = ReasonStatusCode.UNAUTHORIZED, statusCode = StatusCode.UNAUTHORIZED) {
		super(message, statusCode);
	}
}

class NotFoundError extends ErrorResponse {
	constructor(message = ReasonStatusCode.NOTFOUND, statusCode = StatusCode.NOTFOUND) {
		super(message, statusCode);
	}
}

class BadRequestError extends ErrorResponse {
	constructor(message = ReasonStatusCode.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) {
		super(message, statusCode);
	}
}

export { 
	ConflictRequestError,
	BadRequestError,
	UnauthorizedRequestError,
	NotFoundError
}
