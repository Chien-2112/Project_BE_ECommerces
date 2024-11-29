"use strict";

import { BadRequestError } from "../../core/error.response.js";
import { INVENTORIES } from "../../models/inventories.model.js";
import { getProductById } from "./repositories/product.repo.js";

class InventoryService {
	/**
	 * ADD STOCK TO INVENTORY.
	 * => Mục đích: Thêm số lượng hàng vào kho của 1 shop.
	 * 
	 *     stock - Số lượng hàng cần thêm.
	 *     productId - ID của sản phẩm cần cập nhật vào kho.
	 *     shopId - ID của shop sở hữu SP.
	 *     location - Địa chỉ kho lưu trữ hàng.
	 * 
	 * => Kịch bản thực tế:
	 *  Giả sư hệ thống có shop A cần thêm hàng vào kho cho sản phẩm B.
	 *    - Nếu SP B không tồn tại trong kho của shop A, hệ thống:
	 *      +. Kiểm tra SP B có hợp lệ không.
	 *      +. Tạo 1 bản ghi mới trong kho với SL sp và vị trí kho.
	 * 
	 *    - Nếu SP B đã tồn tại trong kho:
	 *      +. Cập nhật số lượng tồn kho.
	 *      +. Cập nhật địa chỉ khi nếu cần.
	 */
	static async addStockToInventory({
		stock, productId, shopId, 
		location = "477, Cam Pha, Quang Ninh"
	}) {
		// Trước khi thêm, kiểm tra sản phẩm có tồn tại hay không.
		const product = await getProductById(productId);
		// Nếu sản phẩm không tồn tại => Dừng việc thêm hàng vào kho.
		if(!product) {
			throw new BadRequestError("The product does not exists!");
		}
		const query = {
			inven_shopId: shopId,
			inven_productId: productId
		};
		const updateSet = {
			$inc: {
				inven_stock: stock
			},
			$set: {
				inven_location: location
			}
		};
		const options = { upsert: true, new: true };

		return await INVENTORIES.findOneAndUpdate(query, updateSet, options);
	}
}

export { InventoryService };