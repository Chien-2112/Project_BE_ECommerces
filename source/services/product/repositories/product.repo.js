"use strict";

import { BadRequestError } from "../../../core/error.response.js";
import { 
	PRODUCT, ELECTRONIC, CLOTHING, FURNITURE 
} from "../../../models/product.model.js";
import { getSelectData, getUnSelectData } from "../../../utils/index.js";

/**
 * FIND ALL DRAFTS FOR SHOP.
 * @Mean - .populate() => Lấy thông tin từ collection liên kết với product_shop
 *                và chỉ chọn các trường name & email, bỏ _id.
 * 			   => Chỉ hoạt động nếu product_shop được định nghĩa là 1 reference trong schema của PRODUCT.
 * @Mean - .lean() => Trả về plain JS object thay vì Mongoose Document. => Giúp tăng hiệu năng.
 * @Mean - .exec() => Được dùng để thực thi truy vấn.
*/
const findAllDraftsForShop = async({ query, limit, skip }) => {
	return await queryProduct({ query, limit, skip });
}

// PUBLISH PRODUCT BY SHOP.
const publishProductByShop = async({ product_shop, product_id }) => {
	const foundShop = await PRODUCT.findOne({
		product_shop: product_shop,
		_id: product_id
	});
	if(!foundShop) return null;

	foundShop.isDraft = false;
	foundShop.isPublished = true;
	const updatedProduct = await foundShop.save();
	return updatedProduct;
}

// FIND ALL PUBLISH PRODUCT FOR SHOP.
const findAllPublishForShop = async({ query, limit, skip }) => {
	return await queryProduct({ query, limit, skip });
}

// OPTIMISE.
const queryProduct = async({ query, limit, skip }) => {
	return await PRODUCT.find(query)
		.populate('product_shop', 'name email -_id')
		.sort({ updateAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean()
		.exec()
}

// UNPUBLISH PRODUCT BY SHOP.
const unPublishProductByShop = async({ product_shop, product_id }) => {
	const foundShop = await PRODUCT.findOne({ 
		product_shop: product_shop,
		_id: product_id
	});
	if(!foundShop) return null;

	foundShop.isDraft = true;
	foundShop.isPublished = false;
	const updatedProduct = await foundShop.save();
	return updatedProduct;
}

// SEARCH PRODUCT BY USER.
/**
 * Thông thường, user sẽ tìm kiếm sản phẩm theo tên or description.
 * => Đánh index cho trường: product_name, product_description trong schema PRODUCT. 
 * 
 * => Chỉ search ra những sản phẩm đã được publish.
*/
const searchProductByUser = async({ keySearch }) => {
	const regexSearch = new RegExp(keySearch);
	const results = await PRODUCT.find(
		{ 
			isPublished: true,
			$text: { $search: regexSearch } 
		},
		{ score: {$meta: 'textScore' } }
	).sort({ score: { $meta: 'textScore' } }).lean();
	return results;
}

// FIND ALL PRODUCTS.
const findAllProducts = async({ limit, sort, page, filter, select }) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
	const products = await PRODUCT.find( filter )
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.select(getSelectData(select))
		.lean()

	return products;
}

// FIND PRODUCT BY ID.
const findProductById = async({ product_id, unSelect }) => {
	return await PRODUCT.findById(
		{ _id: product_id },
	)
		.select(getUnSelectData(unSelect));
}

// UPDATE PRODUCT BY ID.
const updateProductById = async({
	productId, product_shop, payload, model, isNew = true
}) => {
	const updatedProduct = await model.findOneAndUpdate(
		{_id: productId, product_shop: product_shop},
		payload, 
		{ new: isNew }
	);
	console.log(`[8888]::`, updatedProduct);
	if (!updatedProduct) {
		throw new BadRequestError("Product not found or not authorized to update");
	}
	return updatedProduct;
}

// GET PRODUCT BY ID.
const getProductById = async(productId) => {
	return await PRODUCT.findOne({
		_id: productId
	}).lean();
}

/**
 * CHECK PRODUCT BY SERVER.
 * => Kiểm tra thông tin của các sản phẩm trong giỏ hàng
 * 
 * promise.all() => Thực thi 1 danh sách các promise 
 * 	     => Nó sẽ chờ tất cả các promise trong mảng products.map() được giải quyết trước khi trả về KQ.
 * 
 *  => Đảm bảo tất cả các SP trong mảng được kiểm tra song song thay vì tuần từ.
 *  => Từ đó, tiết kiệm thời gian khi có nhiều SP cần kiểm tra.
 */
const checkProductByServer = async(products) => {
	// Trả về 1 Promise - 1 mảng chứa KQ của từng Promise.
	const result = await Promise.all(products.map(async(product) => {
		try {	
			// Mỗi lần lặp, gọi hàm getProductById để lấy thông tin chi tiết của SP từ server.
			const foundProduct = await getProductById(product.productId);
			if(foundProduct) {
				return {
					price: product.price,
					quantity: product.quantity,
					productId: product.productId
				}
			} else {
				console.log(`Product not found or invalid: ${product.productId}`);
				return null;
			}
		} catch(err) {
			console.error(`Error fetching product ${product.productId}`, err.message);
			return null;
		}
	}));
	// Loại bỏ các giá trị null khỏi mảng kết quả.
	return result.filter((item) => item !== null);
}

export { 
	findAllDraftsForShop,
	publishProductByShop,
	findAllPublishForShop,
	unPublishProductByShop,
	searchProductByUser,
	findAllProducts,
	findProductById,
	updateProductById,
	getProductById,
	checkProductByServer
};