"use strict";

import { INVENTORIES } from "../../../models/inventories.model.js";

// INSERT PRODUCT INTO INVENTORY.
// const insertInventory = async({
// 	productId, shopId, stock, location = 'unKnown'
// }) => {
// 	return await INVENTORIES.create({
// 		inven_productId: productId,
// 		inven_shopId: shopId,
// 		inven_stock: stock,
// 		inven_location: location
// 	});
// }

// RESERVATION INVENTORY.
const reservationInventory = async({ productId, quantity, cartId }) => {
	const query = {
		inven_productId: productId,
		inven_stock: {
			$gte: quantity
		}
	}
	const updateSet = {
		$inc: {
			inven_stock: -quantity
		},
		$push: {
			inven_reservations: {
				quantity,
				cartId,
			}
		}
	};
	const options = { upsert: true, new: true };
	
	return await INVENTORIES.updateOne(query, updateSet);
}

export { 
	// insertInventory,
	reservationInventory
};