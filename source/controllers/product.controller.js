"use strict";

import { CREATED } from "../core/success.response.js";
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
}

const instanceProductController = new ProductController();
export default instanceProductController;