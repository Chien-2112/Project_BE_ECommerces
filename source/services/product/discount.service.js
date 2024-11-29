"use strict";

import { 
	BadRequestError, 
	NotFoundError 
} from "../../core/error.response.js";
import { DISCOUNT } from "../../models/discount.model.js";
import { findAllProducts } from "./repositories/product.repo.js";
import {
	findAllDiscountCodesUnSelect,
	findAllDiscountCodesSelect,
	checkDiscountExists
} from "./repositories/discount.repo.js";

class DiscountService {
	/**
	 * FEATURE_1 - GENERATOR DISCOUNT CODE [SHOP | ADMIN].
	 *   => AMDIN - Có thể tạo discount global áp dụng cho tất cả sản phẩm or ngành hàng.
	 *   => SHOP -  Tạo discount local trong shop đó.
	 * 
	 * Ý nghĩa: - Admin quản lý chương trình khuyến mãi lớn trên toàn hệ thống.
	 *          - Chủ shop có quyền tự quản lý & thiết lập khuyến mãi cho SP của mình.
	*/
	static async createDiscountCode(payload) {
		console.log(`[123]::Payload`, payload);
		const {
			discount_name, discount_description, discount_type, discount_value,
			discount_code, discount_start_date, discount_end_date, discount_max_uses,
			discount_uses_count, discount_users_used, discount_max_uses_per_user, discount_min_order_value,
			shopId, discount_is_active, discount_applies_to, discount_product_ids
		} = payload;

		if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
			throw new BadRequestError("Discount code has expired!");
		}
		if(new Date(discount_start_date) >= new Date(discount_end_date)) {
			throw new BadRequestError("Start date must be before end date");
		}

		// CREATE INDEX FOR DISCOUNT CODE.
		const foundDiscount = await DISCOUNT.findOne({
			discount_code: discount_code,
			discount_shopId: shopId
		}).lean();
		if(foundDiscount && foundDiscount.discount_is_active) {
			throw new BadRequestError("Discount has already created!");
		}
		// CREATE NEW DISCOUNT BY [SHOP || ADMIN].
		const newDiscount = await DISCOUNT.create({
			discount_name: discount_name,
			discount_description: discount_description,
			discount_type: discount_type,
			discount_value: discount_value,
			discount_code: discount_code,
			discount_start_date: discount_start_date,
			discount_end_date: discount_end_date,
			discount_max_uses: discount_max_uses,
			discount_uses_count: discount_uses_count,
			discount_users_used: discount_users_used,
			discount_max_uses_per_user: discount_max_uses_per_user,
			discount_min_order_value: discount_min_order_value || 0,
			discount_shopId: shopId,
			discount_is_active: discount_is_active,
			discount_applies_to: discount_applies_to,
			discount_product_ids: discount_applies_to === "all" ? [] : discount_product_ids
		});

		return newDiscount;
	}

	/**
	 * FEATURE_2 - GET DISCOUNT AMOUNT - CỦA SHOP [USER].
	 * => Người dùng có thể kiểm tra giá trị khuyến mãi mà voucher mang lại.
	 * => Được sử dụng khi: 
	 *      - Người dùng nhập mã voucher vào giỏ hàng.
	 *      - Hệ thống tính toán số tiền được giảm & hiển thị cho người dùng.
	 * 
	 * Ý nghĩa: - Giúp người dùng biết chính xác mức giảm giá trước khi hoàn tất đơn hàng.
	 *          - Tăng trải nghiệm minh bạch và rõ ràng cho người mua.
	*/
	static async getDiscountAmount({ code, shopId, userId, products }) {
		const foundDiscount = await checkDiscountExists({
			model: DISCOUNT, 
			filter: {
				discount_code: code,
				discount_shopId: shopId,
			}
		});
		if(!foundDiscount) {
			throw new NotFoundError("Discount not exists!");
		}
		const { 
			discount_is_active,
			discount_max_uses,
			discount_min_order_value,
			discount_type,
			discount_max_uses_per_user,
			discount_value,
			discount_users_used,
			discount_start_date, discount_end_date,
			discount_applies_to,
			discount_product_ids
		} = foundDiscount;
		// Kiểm tra discount code còn hoạt động không.
		if(!discount_is_active) {
			throw new BadRequestError("Discount expired!");
		}
		// Discount_max_uses = 0
		if(!discount_max_uses) {
			throw new BadRequestError("Discount are out!");
		}
		if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
			throw new BadRequestError("Discount code has expired!");
		}
		
		// Kiểm tra người dùng còn lượt sử dụng voucher hay không.
		if(discount_max_uses_per_user > 0) {
			const userUseDiscount = discount_users_used.find(user => user.userId === userId);
			// Người dùng đã sử dụng voucher đó.
			if(userUseDiscount) {
				// Kiểm tra xem đã vượt quá số lần được sử dụng chưa.
				if(userUseDiscount.uses >= discount_max_uses_per_user) {
					throw new BadRequestError("You have reached the maximum uses for this discount!");
				} 
				// Tăng số lần sử dụng voucher.
				userUseDiscount.uses += 1;
			// Người dùng chưa từng sử dụng 
			} else {
				discount_users_used.push(userId);
			}
		}
		
		let totalOrder = 0; 
		let totalDiscount = 0;
		// Tính giá trị giảm giá.
		if(discount_applies_to === "all") {
			// Áp dụng cho toàn bộ đơn hàng.
			totalOrder = products.reduce((sum, product) => {
				return sum + (product.price * product.quantity)
			}, 0);
			if(discount_min_order_value > 0 && totalOrder < discount_min_order_value) {
				throw new BadRequestError(
					`Discount requires a minium order value of ${discount_min_order_value}`
				);
			}
			// Lấy giá trị của voucher.
			const discountAmount = discount_type === "fixed_amount" 
					? Math.min(discount_value, totalOrder)
					: totalOrder * (discount_value / 100);
			return {
				totalOrder, // Tổng giá trị đơn hàng(chưa áp voucher).
				totalDiscount: discountAmount, // Giá trị voucher.
				totalPrice: totalOrder - discountAmount // Tổng đơn hàng sau khi áp voucher.
			}
		} else if(discount_applies_to === "specific") {
			// Áp dụng cho các sản phẩm cụ thể.
			const discountedProducts = products.map(product => {
				const isApplicable = discount_product_ids.includes(product.productId);
				if(!isApplicable) {
					return {
						...product,
						discount: 0 // Không áp dụng giảm giá.
					}
				}
				const productTotal = product.price * product.quantity;
				const discountAmount = discount_type === "fixed_amount"
						? Math.min(discount_value, productTotal)
						: productTotal * (discount_value / 100);
				return {
					... product,
					discount: discountAmount // Giá trị giảm giá cho SP.
				}
			});
			// Tổng đơn hàng + discount.
			totalOrder = discountedProducts.reduce((sum, product) => {
				return sum + (product.price * product.quantity);
			}, 0);
			totalDiscount = discountedProducts.reduce((sum, product) => sum + product.discount, 0);

			if (discount_min_order_value > 0 && totalOrder < discount_min_order_value) {
				throw new BadRequestError(
					`Discount requires a minimum order value of ${discount_min_order_value}`
				);
			}
			return {
				discountedProducts,
				totalOrder,
				totalDiscount,
				totalPrice: totalOrder - totalDiscount,
			};
		}	
	}

	/**
	 * FEATURE_3 - GET ALL DISCOUNT CODES [USER | SHOP]
	 * => USER - Xem tất cả các voucher có thể áp dụng cho họ(có thể là voucher global or mã của shop).
	 * => SHOP - Xem danh sách các voucher họ đã tạo or đang hoạt động trong shop của mình.
	 * 
	 * Ý nghĩa: - Người dùng dễ dàng tìm & sử dụng mã voucher phù hợp.
	 *          - Chủ shop quản lý danh sách voucher đang hoạt động.
	*/
	static async getAllDiscountCodesByShop({ limit, page, shopId, code }) {
		const discounts = await findAllDiscountCodesUnSelect({
			limit: +limit,
			page: +page,
			filter: {
				discount_shopId: shopId,
				discount_is_active: true
			},
			// unSelect: ["__v", "discount_shopId"],
			select: ["discount_name", "discount_code"],
			model: DISCOUNT
		});

		return discounts;
	}
	

	/**
	 * FEATURE_4 - GET ALL PRODUCT BY DISCOUNT CODE [USER]
	 * => Cho phép người dùng xem danh sách sản phẩm áp dụng được voucher cụ thể.
	*/
	static async getAllDiscountCodesWithProduct({
		code, shopId, userId, limit, page
	}) {
		const foundDiscount = await DISCOUNT.findOne({
			discount_code: code,
			discount_shopId: shopId
		}).lean();

		if(!foundDiscount || !foundDiscount.discount_is_active) {
			throw new NotFoundError("Discount not exists!");
		}
		const { 
			discount_applies_to, discount_product_ids
		} = foundDiscount;

		let products;
		if(discount_applies_to === "all") {
			// GET ALL PRODUCT.
			products = await findAllProducts({
				filter: {
					product_shop: discount_shopId,
					isPublished: true
				},
				limit: +limit,
				page: +page,
				sort: "ctime",
				select: ["product_name"]
			});
		}
		if(discount_applies_to === "specific") {
			// GET THE PRODUCTS IDS.
			products = await findAllProducts({
				filter: {
					_id: { $in: discount_product_ids },
					isPublished: true
				},
				limit: +limit,
				page: +page,
				sort: "ctime",
				select: ["product_name"]
			});
		}
		return products;
	}

	/**
	 * FEATURE_5 - DELETE DISCOUNT CODE [ADMIN | SHOP]
	 * => ADMIN - Có quyền xóa bất kỳ voucher nào, cả voucher toàn cục hoặc voucher do shop tạo ra.
	 * => SHOP - Chỉ có thể xóa voucher do chính shop tạo ra.
	 * 
	 * Ý nghĩa: - Admin kiểm soát toàn bộ hệ thống, đảm bảo các mã không vi phạm quy tắc hoặc không còn phù hợp.
	 *          - Chủ shop có thể quản lý và xóa bỏ các mã khuyến mãi cũ hoặc không còn hiệu lực.
	*/
	static async deleteDiscountCode({ shopId, code }) {
		const deleted = await DISCOUNT.findOneAndDelete({
			discount_code: code,
			discount_shopId: shopId
		});
		return deleted;
	}

	/**
	 * FEATURE_6 - CANCEL DISCOUNT CODE [USER]
	 * => Người dùng có thể hủy áp dụng mã giảm giá trong giỏ hàng hoặc giao dịch.
	 * => Được sử dụng khi:
	 *      - Người dùng đổi ý không muốn áp dụng voucher.
	 *      - Voucher bị lỗi hoặc không còn hợp lệ.
	 * 
	 * Ý nghĩa: - Tăng tính linh hoạt trong quá trình mua sắm, giúp người dùng kiểm soát tốt hơn.
	*/
	static async cancelDiscountCode({ code, shopId, userId }) {
		const foundDiscount = await checkDiscountExists({
			model: DISCOUNT,
			filter: {
				discount_code: code,
				discount_shopId: shopId
			}
		});
		if(!foundDiscount) {
			throw new NotFoundError("Discount not exists");
		}
		const result = await DISCOUNT.findByIdAndUpdate(foundDiscount._id, {
			$pull: {
				discount_users_used: userId,
			},
			$inc: {
				discount_max_uses: 1,
				discount_uses_count: -1
			}
		});
		return result;
	}
}

export { DiscountService };