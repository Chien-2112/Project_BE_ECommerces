"use strict";

import { BadRequestError, NotFoundError } from "../../core/error.response.js";
import { CART } from "../../models/cart.model.js";
import { 
	createUserCart,
	updateUserCartQuantity
} from "./repositories/cart.repo.js";
import { getProductById } from "./repositories/product.repo.js";

class CartService {
	/**
	 * FEATURE_1 - ADD PRODUCT TO CART [USER].
	 * => [USER] - Cho phép người dùng chọn 1 hoặc nhiều sản phẩm mà họ quan tâm để thêm vào giỏ hàng.
	 *           => Giúp người dùng quản lý sản phẩm họ dự định mua.
	 * 
	 * => Ý nghĩa: - Cải thiện trải nghiệm mua sắm của người dùng.
	 *             - Lưu trữ tạm thời các sản phẩm người dùng quan tâm.
	 *             - Hỗ trợ người dùng chuẩn bị đơn hàng trước khi thanh toán.
	 * 
	 * {
	 * 	  userId,
	 *    product: { productId, shopId, quantity, name, price }
	 * }
	*/
	static async addProductToCart({ userId, product = {}}) {
		const { quantity } = product;
		const userCart = await CART.findOne({ cart_userId: userId });
		if(!userCart) {
			// Tạo giỏ hàng cho người dùng & thêm sản phẩm.
			return await createUserCart({ 
				userId, quantity, product, model: CART,
				// cartProduct: quantity
			});
		}
		// Đã có giỏ hàng.
		const existingProductIndex = userCart.cart_products.findIndex(
			(cartProduct) => cartProduct.productId === product.productId
		);
		if(existingProductIndex !== -1) {
			// Nếu sản phẩm đã tồn tại, cập nhật số lượng.
			return await updateUserCartQuantity({
				userId, product, model: CART
			});
		}else {
			// Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng.
			userCart.cart_products.push(product);
			userCart.cart_count_product += quantity // Cộng số lượng SP mới.
			return await userCart.save();
		}
	}

	/**
	 * UPDATE PRODUCT QUANTITY.
	 *  - cart_userId: Xác định giỏ hàng của người dùng.
	 *  - productId: Sản phẩm cụ thể cần xóa khỏi giỏ hàng.
	 * 
	 *  +. Khi người dùng muốn tăng số lượng sản phẩm, số lượng sẽ được cộng thêm.
	 *  +. Khi người dùng muốn giảm số lượng, số lượng sẽ được trừ đi,
	 *     và nếu số lượng giảm về 0, sản phẩm sẽ được xóa khỏi giỏ hàng.
	*/
	static async addOrRemoveProductToCart({ userId, shop_order_ids }) {
		// Kiểm tra đầu vào.
		if(!shop_order_ids[0]?.item_products?.length) {
			throw new BadRequestError("[1] - Invalid input: Missing product details.");
		}

		const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];
		if(!productId || quantity == null || old_quantity == null) {
			throw new Error("[2] - Invalid input: Missing product details.");
		}

		// Kiểm tra xem SP có tồn tại hay không.
		const foundProduct = await getProductById(productId);
		if(!foundProduct) throw new NotFoundError("Product Not Found");
		// Kiểm tra SP có thuộc shop đang mua sắm hay không.
		if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
			throw new NotFoundError("Product do not belong to the shop!");
		}

		// Nếu giảm số lượng SP về <= 0 => Thực hiện xóa SP khỏi giỏ hàng.
		if(quantity == 0) {
			return await CartService.deleteUserCartItem({ userId, productId });
		}
		// Cập nhật giỏ hàng tronvg DB.
		return await updateUserCartQuantity({
			userId,
			product: {
				productId,
				quantity: quantity - old_quantity
			},
			model: CART
		});
	}

	/**
	 * FEATURE_3 - DELETE CART ITEM [USER].
	 * => [USER] => Cho phép xóa 1 SP cụ thể khỏi giỏ hàng của người dùng.
	 *              Cung cấp cho người dùng quyền kiểm soát để loại bỏ các SP mà họ không muốn mua nữa.
	 * 
	 * @Mean - Tăng sự linh hoạt & tiện lợi trong việc quản lý giỏ hàng.
	 *             - Giúp giỏ hàng chính xác hơn trước khi người dùng tiến hành thanh toán.
	 * 
	 * @Param - userId, productId.
	*/
	static async deleteUserCartItem({ userId, productId }) {
		console.log(`[Delete User Cart]::`, userId, productId);
		const query = { 
			cart_userId: userId,
			cart_state: "active"
		};
		// Lấy giỏ hàng hiện tại.
		const findUserCart = await CART.findOne(query);
		if(!findUserCart) {
			throw new NotFoundError("Cart Not Found");
		}
		// Tìm sản phẩm cần xóa trong giỏ hàng.
		const findProductToDelete = findUserCart.cart_products.find(
			(cartProduct) => cartProduct.productId === productId
		)
		if(!findProductToDelete) {
			throw new NotFoundError("Product Not Found in Cart!");
		}
		const { quantity } = findProductToDelete;
		// Xóa SP khỏi giỏ hàng & cart_count_product.
		const updateSet = {
			/**
			 * $pull - Xóa 1 hoặc nhiều phần tử trong 1 mảng dựa trên điều kiện.
			 * VD: Mảng cart_products sẽ xóa tất cả các phần tử có productId khớp với giá trị được cung cấp.
			 */
			$pull: {
				cart_products: { productId }
			},
			$inc: {
				// Giảm số lượng tổng SP.
				cart_count_product: -quantity
			}
		}
		// Cập nhật giỏ hàng.
		const deleteCart = await CART.updateOne(query, updateSet);
		return deleteCart;
	}
	
	/**
	 * FEATURE_4 - GET CART [USER].
	 * => [USER] => Cho phép lấy thông tin giỏ hàng của người dùng hiện tại từ hệ thống.
	 * 
	 * => Ý nghĩa: - Hiển thị tất cả các sản phẩm người dùng đã thêm vào giỏ hàng.
	 *             - Ghi nhận trạng thái hiện tại của giỏ hàng(số lượng SP, giá, ưu đãi, tổng tiền,...)
	*/
	static async getListProductCart({ userId }) {
		const findUserCart = await CART.findOne({
			cart_userId: userId,
			cart_state: "active"
		}).lean();
		if(!findUserCart) throw new NotFoundError("Cart Not Found");
		return findUserCart;
	}
}

export { CartService };