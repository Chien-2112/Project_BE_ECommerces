"use strict";

import { CREATED, OK, SuccessResponse } from "../core/success.response.js";
import { ProductFactory } from "../services/product/product.service.js";

class ProductController {
	// CREATE NEW PRODUCT.
	createProduct = async(request, response, next) => {
		new CREATED({
			message: "Create new Product success!",
			metadata: await ProductFactory.createProduct(
				request.body.product_type, 
				{
					...request.body,
					product_shop: request.user.userId
				}
			)
		}).send(response);
	}

	// UPDATE PRODUCT BY ID.
	updateProductById = async(request, response, next) => {
		new SuccessResponse({
			message: "Update Product By Id successfully!",
			metadata: await ProductFactory.updateProduct(
				request.body.product_type,
				request.params.productId,
				request.user.userId,
				{
					...request.body,
					product_shop: request.user.userId
				}
			)
		}).send(response);
	}

	// ------------------ QUERY ----------------------
	// GET ALL DRAFTS PRODUCT FOR SHOP.
	getAllDraftsForShop = async(request, response, next) => {
		new SuccessResponse({
			message: "Get All Drafts For Shop successfully!",
			metadata: await ProductFactory.findAllDraftsForShop({
				product_shop: request.user.userId
			})
		}).send(response);
	}

	// GET ALL PUBLISH PRODUCT FOR SHOP.
	getAllPublishForShop = async(request, response, next) => {
		new SuccessResponse({

			message: "Get All Publish For Shop successfully!",
			metadata: await ProductFactory.findAllPublishForShop({
				product_shop: request.user.userId
			})
		}).send(response);
	}

	// PUBLISHED PRODUCT BY SHOP.
	publishProductByShop = async(request, response, next) => {
		new SuccessResponse({
			message: "Publish Product successfully!",
			metadata: await ProductFactory.publishProductByShop({
				product_shop: request.user.userId,
				product_id: request.params.id
			})
		}).send(response);
	}

	// UNPUBLISHED PRODUCT BY SHOP.
	unPublishProductByShop = async(request, response, next) => {
		new SuccessResponse({
			message: "UnPublish Product successfully!",
			metadata: await ProductFactory.unPublishProductByShop({
				product_shop: request.user.userId,
				product_id: request.params.id
			})
		}).send(response);
	}

	// GET LIST SEARCH PRODUCT.
	getListSearchProduct = async(request, response, next) => {
		new SuccessResponse({
			message: "Get List Search Product successfully!",
			metadata: await ProductFactory.getListSearchProduct(request.params)
		}).send(response);
	}

	// FIND ALL PRODUCTS.
	findAllProducts = async(request, response, next) => {
		new SuccessResponse({
			message: "Find All Product successfully!",
			metadata: await ProductFactory.findAllProducts(request.query)
		}).send(response);
	}

	// FIND PRODUCT BY ID.
	findProductById = async(request, response, next) => {
		new SuccessResponse({
			message: "Find Product By Id successfully!",
			metadata: await ProductFactory.findProduct({
				product_id: request.params.productId
			})
		}).send(response);
	}

	// 
}

const instanceProductController = new ProductController();
export default instanceProductController;