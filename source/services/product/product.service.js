"use strict";

import { BadRequestError } from "../../core/error.response.js";
import { 
	PRODUCT, CLOTHING, ELECTRONIC, FURNITURE 
} from "../../models/product.model.js";

// FACTORY - DESIGN PATTERN.
class ProductFactory {
	/**
	 * type: "Clothing", "Furniture", "Electronics".
	*/
	static async createProduct(type, payload) {
		switch(type) {
			case "Clothing":
				return new Clothing(payload).createProduct();
			case "Electronic":
				return new Electronic(payload).createProduct();
			case "Furniture":
				return new Furniture(payload).createProduct();
			default: 
				throw new BadRequestError(`Invalid Product Types ${type}`);
		}
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
		return await PRODUCT.create({...this, _id: product_id});
	}
}

/**
 * SUB-CLASS - PRODUCT TYPE: CLOTHING.
*/
class Clothing extends Product {
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
}

/**
 * SUB-CLASS - PRODUCT TYPE: ELECTRONIC.
*/
class Electronic extends Product {
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
}

/**
 * SUB-CLASS - PRODUCT TYPE: FURNITURE.
*/
class Furniture extends Product {
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
}

export { ProductFactory };