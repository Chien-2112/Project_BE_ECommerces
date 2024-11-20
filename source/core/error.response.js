"use strict";

const StatusCode = {
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	CONFLICT: 409,
	NOTFOUND: 404
}

const ReasonStatusCode = {
	/**
	 * 401 - UNAUTHORIZED. 
	 *   Lỗi này thường xảy ra khi:
	 * 	  +. Người dùng không cung cấp thông tin xác thực: token, username, password.
	 *    +. Token đã hết hạn hoặc không hợp lệ.
	 *    +. Người dùng không có quyền truy cập vào tài nguyên.
	 * 
	 * => KL: Người dùng chưa xác thực.
	 */
	UNAUTHORIZED: 'Unauthorized',

	/**
	 * 403 - FORBIDDEN.
	 *   Lỗi này xảy ra khi server hiểu yêu cầu từ client nhưng từ chối thực hiện do:
	 *    +. Người dùng đã xác thực nhưng không có quyền truy cập vào tài nguyên.
	 *       (VD: Không có role hoặc permission trong hệ thống).
	 *    +. Tài nguyên bị hạn chế truy cập(như chỉ dành cho admin).
	 *    +. IP hoặc vùng địa lý bị chặn bởi server.
	 * 
	 * => KL: Người dùng đã xác thực nhưng không đủ quyền truy cập.
	 */
	FORBIDDEN: 'Bad Request Error',

	/**
	 * 409 - CONFLICT.
	 *   Lỗi này xảy ra khi yêu cầu từ client không thể hoàn thành vì nó gây ra xung đột với trạng thái hiện tại của tài nguyên trên server.
	 *     +. Username hoặc email đã tồn tại trong DB.
	 *     +. Hai người dùng cùng chỉnh sửa 1 tài nguyên dẫn đến xung đột.
	 *     +. Vi phạm logic nghiệp vụ(VD: Đặt lịch hẹn vào thời gian đã được đặt trước).
	 */
	CONFLICT: "Conflict Error",
	NOTFOUND: "Not Found"
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

class BadRequestError extends ErrorResponse {
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

export { 
	ConflictRequestError,
	BadRequestError,
	UnauthorizedRequestError,
	NotFoundError
}