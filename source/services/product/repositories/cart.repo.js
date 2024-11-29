"use strict";

/**
	* CREATE NEW CART FOR USER.
	* => Tạo mới giỏ hàng hoặc cập nhật giỏ hàng hiện có của người dùng.
	* => Cập nhật tổng số lượng tất cả các sản phẩm trong giỏ hàng.
*/
const createUserCart = async({ userId, quantity, product, model }) => {
	const query = { cart_userId: userId, cart_state: "active" };
	const updateOrInsert = {
		$addToSet: {
			cart_products: product
		},
		$inc: {
			cart_count_product: quantity
		}
	}, options = { upsert: true, new: true };
	return await model.findOneAndUpdate(query, updateOrInsert, options);
}

/**
    * UPDATE CART PRODUCT QUANTITY
	* => [USER] - Cho phép người dùng tăng hoặc giảm số lượng của một sản phẩm trong giỏ hàng.
	*
	* => Ý nghĩa: - Giúp người dùng dễ dàng quản lý giỏ hàng.
	* - cart_userId: ID của người dùng mà giỏ hàng thuộc về.
	* - product: Một đối tượng chứa thông tin:
	*          +. productId: ID của sản phẩm cần cập nhật số lượng.
	*          +. quantity: Giá trị số lượng thay đổi.
*/
const updateUserCartQuantity = async({ userId, product, model }) => {
	const { productId, quantity } = product;
	// Xác định giỏ hàng cần cập nhật.
	const query = { 
		cart_userId: userId,
		'cart_products.productId': productId,
		cart_state: "active"
	};
	// Tính tổng số lượng sản phẩm trong giỏ hàng
    // const totalQuantity = userCart.cart_products.reduce((total, product) => total + product.quantity, 0);

	const updateSet = {
		/**
		 * Cập nhật số lượng sản phẩm.
		 * => Toán tử $inc: Tăng hoặc giảm giá trị của 1 trường.
		 * 
		 * Tăng số lượng nếu giá trị quantity > 0.
		 * Giảm số lượng nếu giá trị quantity < 0.
		 */
		$inc: {
			'cart_products.$.quantity': quantity,
			cart_count_product: quantity
		}
	}
	const options = { upsert: true, new: true };
	return await model.findOneAndUpdate(query, updateSet, options);
}

// FIND CART BY ID.
const findCartById = async({ cartId, model }) => {
	return await model.findOne({
		_id: cartId,
		cart_state: "active"
	}).lean();
};

export { 
	findCartById,
	createUserCart,
	updateUserCartQuantity
};