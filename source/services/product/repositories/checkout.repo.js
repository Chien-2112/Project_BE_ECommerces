"use strict";

import { BadRequestError, NotFoundError } from "../../../core/error.response.js";
import { INVENTORIES } from "../../../models/inventories.model.js";
import { ORDER } from "../../../models/order.model.js";

// GET ORDERS BY USER.
const findOrderByUser = async({
	userId, page = 1, limit = 50, sort = 'ctime'
}) => {
	const skip = (page - 1) * limit;
	// Sắp xếp theo thời gian tạo(mặc định mới nhất hiển thị trước).
	const sortBy = sort === 'ctime' ? { createdAt: -1 } : { createdAt: 1 };
	const filter = {
		order_userId: userId 
	}
	const orders = await ORDER.find(filter)
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.lean()
	const totalOrders = await ORDER.countDocuments(filter);

	return {
		metadata: {
			total: totalOrders,
			data: orders
		}
	}
}

// GET ONE ORDER BY USER.
const findOneOrderByUser = async({ userId, orderId }) => {
	const order = await ORDER.findOne({
		_id: orderId,
		order_userId: userId
	}).lean();
	if(!order) {
		throw new NotFoundError("Order not found or you're not authenticated to access");
	}
	return order;
}

// CANCEL ORDER BY USER.
const cancelOrderByUser = async({ orderId, userId }) => {
	// Tìm đơn hàng cần hủy.
	const order = await ORDER.findOne({
		_id: orderId,
		order_userId: userId
	});
	if(!order) {
		throw new NotFoundError("Order not found or you're not authenticated to access");
	}
	/**
	 * Kiểm tra trạng thái đơn hàng.
	 * => Chỉ cho phép người dùng hủy khi chưa được vận chuyển.
	*/
	if(order.order_status === "shipped") {
		throw new BadRequestError("Order has already shipped. Not cancel!!");
	}
	// Cập nhật trạng thái đơn hàng thành "cancelled".
	order.order_status = "cancelled";
	await order.save();

	// Hoàn lại số lượng SP vào kho.
	const products = order.order_products;
	for(const item of products) {
		await INVENTORIES.updateOne(
			{ inven_productId: item.productId },
			{ $inc: { inven_stock: item.quantity }}
		);
	}
	return order;
}

export { 
	findOrderByUser,
	findOneOrderByUser,
	cancelOrderByUser
};