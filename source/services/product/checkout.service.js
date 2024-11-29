"use strict";

import { BadRequestError, NotFoundError } from "../../core/error.response.js";
import { CART } from "../../models/cart.model.js";
import { findCartById } from "./repositories/cart.repo.js";
import { checkProductByServer } from "./repositories/product.repo.js";
import { DiscountService } from "./discount.service.js";
import { acquireLock, releaseLock } from "./redis.service.js";
import { ORDER } from "../../models/order.model.js";
import { 
	findOrderByUser,
	findOneOrderByUser,
	cancelOrderByUser,
} from "./repositories/checkout.repo.js";

class CheckoutService {
	/**
	 * CHECKOUT REVIEW.
	 * => Mục đích: Kiểm tra các thông tin liên quan đến giỏ hàng và đơn hàng của người dùng trước khi hoàn tất quy trình thanh toán hoặc đặt hàng.
	 * 
	 * Format input:
	 *  {
	 * 		cartId - ID của giỏ hàng người dùng,
	 *      userId - ID của người dùng sở hữu giỏ hàng,
	 *      shop_order_ids: [
	 * 			 { shopId, shopDiscounts: [], item_products: [{ price, quantity, productId }] },
	 *           { shopId, shopDiscounts: [], item_products: [{ price, quantity, productId }] },
	 *           ...
	 *      ] - Danh sách các sản phẩm ,
	 *  }
	*/
	static async CheckoutReview({
		cartId, userId, shop_order_ids = [],
	}) {
		// Xác thực giỏ hàng tồn tại.
		const foundCart = await findCartById({
			cartId, model: CART
		});
		if(!foundCart) throw new NotFoundError("Cart Not Found");
		const checkout_order = {
			totalPrice: 0, // Tổng tiền hàng.
			feeShip: 0, // Phí vận chuyển.
			totalDiscount: 0, // Tổng tiền discount giảm giá.
			totalCheckout: 0 // Tổng thanh toán.
		}
		const shop_order_ids_new = [];
		
		// Xử lý các sản phẩm của từng SHOP.
		for(let i = 0; i < shop_order_ids.length; i++) {
			const { shopId, shop_Discounts = [], item_products = [] } = shop_order_ids[i];

			// Kiểm tra thông tin sản phẩm => Trả về 1 mảng các object chứa thông tin SP.
			const checkProductServer = await checkProductByServer(item_products);
			console.log(`[C]::CheckProductServer::`, checkProductServer);
			if(!checkProductServer) {
				throw new BadRequestError("Order Wrong!");
			}
			// Tính tổng tiền của các SP trong từng shopId.
			const checkoutPrice = checkProductServer.reduce((acc, product) => {
				return acc + (product.quantity * product.price);
			}, 0);
			// Tổng tiền trước khi xử lý.
			checkout_order.totalPrice += checkoutPrice;

			const itemCheckout = {
				shopId,
				shop_Discounts,
				priceRaw: checkoutPrice, // Tiền trước khi giảm giá.
				priceApplyDiscount: checkoutPrice,
				item_products: checkProductServer
			}
			// Nếu shop_discounts tồn tại > 0, kiểm tra có hợp lệ không.
			if(shop_Discounts.length > 0) {
				// Giả sử chỉ có 1 discount => Get discount amount.
				const { totalDiscount = 0 } = await DiscountService.getDiscountAmount({
					code: shop_Discounts[0].codeId,
					shopId, userId, products: checkProductServer
				});
				// Tổng cộng discount giảm giá.
				checkout_order.totalDiscount += totalDiscount;
				if(totalDiscount > 0) {
					itemCheckout.priceApplyDiscount = checkoutPrice - totalDiscount;
				}
			}
			// Tổng tiền thanh toán cuối cùng.
			checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
			shop_order_ids_new.push(itemCheckout);

			// ÁP DỤNG TRONG TRƯỜNG HỢP CÓ NHIỀU DISCOUNT.
			// if(shop_Discounts.length > 0) {
			// 	let discountTotal = 0; // Tổng giảm giá cho shop này.

			// 	for(let i = 0; i < shop_Discounts.length; i++) {
			// 		// Lấy giá trị giảm giá của từng discount.
			// 		const { total = 0, discount = 0 } = await DiscountService.getDiscountAmount({
			// 			codeId: shop_Discounts[i].codeId,
			// 			shopId, userId, products: checkProductServer
			// 		});
			// 		if(discount > 0) {
			// 			discountTotal += discount;
			// 		}
			// 	}
			// 	// Giảm giá không được vượt quá giá trị của SP.
			// 	discountTotal = Math.min(discountTotal, checkoutPrice);
			// 	// Cập nhật tổng giảm giá.
			// 	checkout_order.totalDiscount += discountTotal;
			// 	// Cập nhật giá sau khi áp dụng giảm giá.
			// 	if (discountTotal > 0) {
			// 		itemCheckout.priceApplyDiscount = checkoutPrice - discountTotal;
			// 	}
			// }
		}
		return {
			shop_order_ids_new,
			checkout_order
		}
	};

	// ORDER BY USER.
	static async orderByUser({
		shop_order_ids,
		cartId, userId, 
		user_address = "08, Cam Thinh, Cam Pha, Quang Ninh", 
		user_payment = {}
	}) {
		// Lấy ra DL đặt hàng từ người dùng.
		const { shop_order_ids_new, checkout_order } = await CheckoutService.CheckoutReview({
			cartId, userId, shop_order_ids
		});
		console.log(`[Review]::`, shop_order_ids_new);
		console.log(`[Review]::`, checkout_order);
		// Kiểm tra xem vượt tồn kho không.
		const products = shop_order_ids_new.flatMap(
			(order) => order.item_products
		);
		console.log(`[1]::Order Product::`, products);
		const acquireErrors = []; // Thu thập lỗi

		// Khóa các SP để kiểm soát số lượng tồn kho.
		for(let i = 0; i < products.length; i++) {
			const { productId, quantity } = products[i];
			const keyLock = await acquireLock(productId, quantity, cartId);
			console.log(`acquireLock for ${productId} result: ${keyLock}`);
			if (!keyLock) {
				acquireErrors.push({ productId, quantity });
			} else {
				await releaseLock(keyLock);
			}
		}
		// Nếu có sản phẩm không khóa được.
		if (acquireErrors.length > 0) {
			console.error("Không khóa được các sản phẩm:", acquireErrors);
			throw new BadRequestError(
				`Một số sản phẩm không còn đủ tồn kho: ${acquireErrors
					.map((err) => `Sản phẩm ${err.productId}, số lượng: ${err.quantity}`)
					.join("; ")}`
			);
		}
		console.log("OK");
		
		// Tạo đơn hàng nếu tất cả sản phẩm đều hợp lệ.
		const newOrder = await ORDER.create({
			order_userId: userId,
			order_checkout: checkout_order,
			order_shipping: user_address,
			order_payment: user_payment,
			order_products: shop_order_ids_new
		});
		/**
		 * Nếu đặt hàng thành công => Xóa sản phẩm khỏi giỏ hàng.
		 *  => Mục đích:  - Xóa các SP đã đặt để tránh người dùng đặt lại nhầm 
		 * 					or SP dư thừa trong giỏ hàng.
		 */
		if(newOrder) {
			/**
			 * cart_products - Danh sách các SP trong giỏ hàng của người dùng.
			 * products - Danh sách các SP người dùng muốn đặt.
			 * => Chỉ có các SP có ID trùng với ID nằm trong products mới bị xóa.
			 */
			await CART.deleteMany({
				cart_userId: userId,
				"cart_products.productId": {
					// Kiểm tra xem productId có nằm trong danh sách các giá trị cho trước không.
					$in: products.map((product) => product.productId)
				}
			})
		}
		return newOrder;
	}

	// QUERY.
	/**
	 * GET ORDERS BY USER.
	 * => Mục đích: Lấy danh sách đơn hàng của một người dùng cụ thể.
	 * => Logic bao gồm: việc lọc, phân trang & sắp xếp DL để trả về thông tin đơn hàng.
	 * 
	 */
	static async getOrdersByUser({
		userId, page, limit, sort
	}) {
		return await findOrderByUser(
			{ userId, page, limit, sort }
		);
	}

	/**
	 * GET ONE ORDER BY USER.
	 * => Mục đích: Xem chi tiết 1 đơn hàng.Model.deleteMany({ 
		 field: 'filter' 
		 field: '{ gte: 0' }
	 }, (err) => {
		console.log(`Error: ` + err)
		
	 }); 
	*/
	static async getOneOrderByUser() {
		return await findOneOrderByUser({ userId, orderId });
	}

	// CANCEL ORDER BY USER.
	static async cancelOrderByUser() {
		return await cancelOrderByUser({ orderId, userId });
	}

	// UPDATE ORDER STATUS [SHOP | ADMIN].
	static async updateOrderStatusByShop() {
		return await updateOrderStatusByShop();
	}
}

export { CheckoutService };