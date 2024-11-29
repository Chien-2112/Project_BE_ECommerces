"use strict";

import { BadRequestError } from "../../core/error.response.js";
import { 
	PRODUCT, CLOTHING, ELECTRONIC, FURNITURE 
} from "../../models/product.model.js";
import { removeUndefinedObject } from "../../utils/index.js";
import { 
	findAllDraftsForShop,
	publishProductByShop,
	findAllPublishForShop,
	unPublishProductByShop,
	searchProductByUser,
	findAllProducts,
	findProductById,
	updateProductById
} from "./repositories/product.repo.js";
// import { insertInventory } from "./repositories/inventory.repo.js";
import { InventoryService } from "./inventory.service.js";

// FACTORY - DESIGN PATTERN.
class ProductFactory {
	/**
	 * type: "Clothing", "Furniture", "Electronics".
	 * => Mỗi lần add 1 type mới là phải sửa đổi code => Chưa tối ưu.
	 * => Vi phạm nguyên tắc lập trình trong SOLID.
	*/
	// static async createProduct(type, payload) {
	// 	switch(type) {
	// 		case "Clothing":
	// 			return new Clothing(payload).createProduct();
	// 		case "Electronic":
	// 			return new Electronic(payload).createProduct();
	// 		case "Furniture":
	// 			return new Furniture(payload).createProduct();
	// 		default: 
	// 			throw new BadRequestError(`Invalid Product Types ${type}`);
	// 	}
	// }

	/**
	 * OPTIMISE 
	*/
	static productRegistry = {} // Key-class
	static registerProductType(type, classRef) {
		ProductFactory.productRegistry[type] = classRef;
	}
	// CREATE PRODUCT.
	static async createProduct(type, payload) {
		const productClass = ProductFactory.productRegistry[type];
		if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

		return new productClass(payload).createProduct();
	}

	// UPDATE PRODUCT BY ID.
	static async updateProduct(type, productId, product_shop, payload) {
		const productClass = ProductFactory.productRegistry[type];
		if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

		return new productClass(payload).updateProduct(productId, product_shop);
	}

	// FIND ALL DRAFT FOR SHOP.
	/**
	 * @Desc - Get all drafts for shop.
	 * @param {Number} limit
	 * @param {Number} skip
	 * @return { JSON }
	*/
	static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0}) {
		const query = { product_shop, isDraft: true };
		console.log(`[1] - Query Drafts::`, query);
		return await findAllDraftsForShop({ query, limit, skip });
	}

	// PUBLISH PRODUCT BY SHOP.
	static async publishProductByShop({ product_shop, product_id }) {
		return await publishProductByShop({ product_shop, product_id });
	}

	// UNPUBLISH PRODUCT BY SHOP.
	static async unPublishProductByShop({ product_shop, product_id }) {
		return await unPublishProductByShop({ product_shop, product_id });
	}

	// FIND ALL PUBLISH PRODUCT FOR SHOP.
	static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
		const query = { product_shop, isPublished: true };
		console.log(`[2] - Query Publish::`, query);
		return await findAllPublishForShop({ query, limit, skip });
	}

	// SEARCH PRODUCT BY USER.
	static async getListSearchProduct({ keySearch }) {
		return await searchProductByUser({ keySearch });
	}

	// FIND ALL PRODUCTS.
	static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true }}) {
		return await findAllProducts({ 
			limit, sort, filter, page,
			select: ['product_name', 'product_price', 'product_thumb', 'product_description', 'product_shop']
		});
	}

	// FIND PRODUCT
	static async findProduct({ product_id }) {
		return await findProductById({
			product_id, 
			unSelect: ['__v', 'product_variations']
		})
	}
}

/**
 * BASE PRODUCT CLASS.
 *   => Chứa những thuộc tính chung của Product.
*/
class Product {
	constructor({
		product_name, product_thumb, product_description, product_price,
		product_quantity, product_type, product_shop, product_attributes
	}) {
		this.product_name = product_name;
		this.product_thumb = product_thumb;
		this.product_description = product_description;
		this.product_price = product_price;
		this.product_quantity = product_quantity;
		this.product_type = product_type;
		this.product_shop = product_shop;
		this.product_attributes = product_attributes;
	}

	// CREATE NEW PRODUCT.
	async createProduct( product_id ) {
		const newProduct = await PRODUCT.create({...this, _id: product_id});
		if(newProduct) {
			// Add product_stock in inventory collection.
			// await insertInventory({
			// 	productId: newProduct._id,
			// 	shopId: this.product_shop,
			// 	stock: this.product_quantity
			// });
			await InventoryService.addStockToInventory({
				productId: newProduct._id,
				shopId: this.product_shop,
				stock: this.product_quantity
			});
		}
		return newProduct;
	}

	// UPDATE PRODUCT.
	async updateProduct( productId, product_shop, payload ) {
		return await updateProductById({ productId, product_shop, payload, model: PRODUCT });
	}
}

/**
 * SUB-CLASS - PRODUCT TYPE: CLOTHING.
*/
class Clothing extends Product {
	// CREATE PRODUCT.
	async createProduct() {
		const newClothing = await CLOTHING.create({
			...this.product_attributes,
			product_shop: this.product_shop

		});
		if(!newClothing) {
			throw new BadRequestError("Create new Clothing error");
		}
		const newProduct = await super.createProduct(newClothing._id);
		if(!newProduct) throw new BadRequestError("Create new Product error");

		return newProduct;
	}

	// UPDATE PRODUCT.
	async updateProduct( productId, product_shop ) {
		console.log(`[1]::`, this);
		const objParams = removeUndefinedObject(this);
		console.log(`[2]::`, objParams);

		if(objParams.product_attributes) {
			await updateProductById({ 
				productId, product_shop, objParams, model: CLOTHING 
			});
		}
		const updatedProduct = await super.updateProduct(productId, product_shop, objParams);
		return updatedProduct;
	}
}

/**
 * SUB-CLASS - PRODUCT TYPE: ELECTRONIC.
*/
class Electronic extends Product {
	// CREATE NEW PRODUCT.
	async createProduct() {
		const newElectronic = await ELECTRONIC.create({
			...this.product_attributes,
			product_shop: this.product_shop
		});
		if(!newElectronic) {
			throw new BadRequestError("Create new Electronic error");
		}
		const newProduct = await super.createProduct(newElectronic._id);
		if(!newProduct) throw new BadRequestError("Create new Product error");

		return newProduct;
	}

	// UPDATE PRODUCT.
	async updateProduct( productId, product_shop ) {
		console.log(`[1]::`, this);
		const objParams = removeUndefinedObject(this);
		console.log(`[2]::`, objParams);

		if(objParams.product_attributes) {
			await updateProductById({ 
				productId, product_shop, objParams, model: ELECTRONIC 
			});
		}
		const updatedProduct = await super.updateProduct(productId, product_shop, objParams);
		return updatedProduct;
	}
}

/**
 * SUB-CLASS - PRODUCT TYPE: FURNITURE.
*/
class Furniture extends Product {
	// CREATE NEW PRODUCT.
	async createProduct() {
		const newFurniture = await FURNITURE.create({
			...this.product_attributes,
			product_shop: this.product_shop
		});
		if(!newFurniture) {
			throw new BadRequestError("Create new Furniture error");
		}
		const newProduct = await super.createProduct(newFurniture._id);
		if(!newProduct) throw new BadRequestError("Create new Product error");

		return newProduct;
	}

	// UPDATE PRODUCT.
	async updateProduct( productId, product_shop ) {
		console.log(`[1]::`, this);
		const objParams = removeUndefinedObject(this);
		console.log(`[2]::`, objParams);

		if(objParams.product_attributes) {
			await updateProductById({ 
				productId, objParams, model: FURNITURE 
			});
		}
		const updatedProduct = await super.updateProduct(productId, product_shop, objParams);
		return updatedProduct;
	}
}

// REGISTER PRODUCT TYPE.
// Trong TH có nhiều class => Sử dụng Strategy.
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);

export { ProductFactory };