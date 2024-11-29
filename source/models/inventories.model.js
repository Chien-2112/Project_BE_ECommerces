import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const inventorySchema = new Schema({
	inven_productId: {
		type: Schema.Types.ObjectId,
		ref: "Product"
	},
	inven_shopId: {
		type: Schema.Types.ObjectId,
		ref: "Shop"
	},
	inven_stock: {
		type: Number,
		required: true
	},
	inven_location: {
		type: String,
		default: "UnKnown"
	},
	inven_reservations: {
		type: Array,
		default: []
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
});

const INVENTORIES = model(DOCUMENT_NAME, inventorySchema);
export { INVENTORIES };