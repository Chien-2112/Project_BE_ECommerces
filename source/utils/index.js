"use strict";
import _ from "lodash";

// GET INFO DATA.
const getInfoData = ({fields = [], object = {}}) => {
	return _.pick(object, fields);
}

// CONVERT ARRAY -> OBJECT.
/**
 * Hàm getSelectData => Sử dụng để chuyển đổi một mảng các chuỗi thành 1 object theo định dạng 
 * 				thường được sử dụng trong Mongoose để chỉ định các trường cần truy vấn.
 * 
 * Cú pháp:  select - Là 1 mảng chứa các trường muốn select.
 *           map - Lặp qua từng phần tử trong mảng và biến đổi mỗi phần tử thành 1 cặp [key, value].
 * 				 - Trong đó:  +. key - Tên trường.
 *                            +. value - Là 1 - Biểu thị rằng trường đó cần được chọn.
 *           Object.fromEntries() - Chuyển danh sách các cặp [key, value] thành 1 object.
 * => Nếu không truyền select hoặc truyền mảng rỗng 
 * => Hàm này sẽ trả về 1 object rỗng {} - Mặc định sẽ lấy toàn bộ dữ liệu.
 * 
 * VD: select = ['name', 'email']
 * => KQ: { name: 1, email: 1 }
*/
const getSelectData = (select = []) => {
	return Object.fromEntries(select.map(el => [el, 1]));
}

const getUnSelectData = (select = []) => {
	return Object.fromEntries(select.map(el => [el, 0]));
}

/**
 * Hàm removeUndefinedObject => Loại bỏ tất cả các thuộc tính có giá trị null hoặc undefined khỏi 1 đối tượng.
*/
const removeUndefinedObject = (obj) => {
	Object.keys(obj).forEach(key => {
		if( obj[key] && typeof obj[key] === 'object') {
			removeUndefinedObject(obj[key]);
		} else if(obj[key] == null) {
			delete obj[key];
		}
	});
	return obj;
}

export { 
	getInfoData, 
	getSelectData, 
	getUnSelectData,
	removeUndefinedObject
};