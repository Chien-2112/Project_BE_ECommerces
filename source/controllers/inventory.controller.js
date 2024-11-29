"use strict";

import { InventoryService } from "../services/product/inventory.service.js";
import { SuccessResponse } from "../core/success.response.js";

class InventoryController {
	addStockToInventory = async(request, response, next) => {
		new SuccessResponse({
			message: "Add Stock to Inventory successfully!",
			metadata: await InventoryService.addStockToInventory({
				...request.body,
				shopId: request.user.userId
			})
		}).send(response);
	}
}

const instanceInventoryController = new InventoryController();
export { instanceInventoryController };