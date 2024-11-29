"use strict";

import { createClient } from "redis";
import { promisify } from "util";
import { reservationInventory } from "./repositories/inventory.repo.js";

const resClient = await createClient()
	.on('error', err => console.log('Redis Client Error', err))
	.connect();

const pexpire = promisify(resClient.pExpire).bind(resClient);
const setnxAsync = promisify(resClient.setNX).bind(resClient);

const acquireLock = async(productId, quantity, cartId) => {
	const key = `lock_v2024_${productId}`;
	const retryTimes = 10;
	const expireTime = 3000;
  
	for (let i = 0; i < retryTimes; i++) {
	  const result = await setnxAsync(key, "lock");
	  console.log(`Result:::`, result);
	  if(result === 1) {
		try {
		  const isReversation = await reservationInventory({ productId, quantity, cartId });
		  if (isReversation.modifiedCount) {
			await pexpire(key, expireTime);
			return key;
		  } else {
			await releaseLock(key);
		  }
		} catch (err) {
		  console.error('Error during reservation:', err);
		  await releaseLock(key);
		}
	  } else {
		await new Promise(resolve => setTimeout(resolve, 50));
	  }
	}
  }
  

const releaseLock = async(keyLock) => {
	const delAsyncKey = promisify(resClient.del).bind(resClient);
	return await delAsyncKey();
}

export { acquireLock, releaseLock };