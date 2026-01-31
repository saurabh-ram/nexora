import { redis } from "../infrastructure/database.js";

const getDataFromCache = async (key, queryfn, jsonCreatorFn) => {
  let posts = [];

  // Redis
  const isCached = await checkCache(key);
  if (isCached) {
    posts = await getCachedData(key);
  } else {
    const resultRows = await queryfn();

    resultRows.rows.forEach((post) => {
      posts.push(jsonCreatorFn(post));
    });
    await setDataInCache(key, posts); // Cache for 1 hour by default
  }
  return posts;
};

// const withCache = (cacheKey) => {
//   return (fn) => {
//     return async () => {
//       const cached = cache.get(cacheKey);
//       if (cached) {
//         return cached;
//       }

//       const result = await fn();
//       cache.set(cacheKey, result);
//       return result;
//     };
//   };
// };

// const withRetry = (retries) => {
//   return (fn) => {
//     return async () => {
//       for (let i = 0; i <= retries; i++) {
//         try {
//           return await fn();
//         } catch (err) {
//           if (i === retries) throw err;
//         }
//       }
//     };
//   };
// };

// const query = withCache('user:1')(
//   withRetry(2)(
//     () => repo.findById(1)
//   )
// );

// const user = await query();

// function normalizeParams(params) {
//   if (params == null) return [];
//   return Array.isArray(params) ? params : [params];
// }


const checkCache = async (key) => {
  // Redis
  const cachedPosts = await redis.get(key);
  if (cachedPosts) {
    return true;
  }
  return false;
};

const getCachedData = async (key) => {
  let data = [];
  const cachedData = await redis.get(key);
  if (typeof cachedData == "string") {
    data = JSON.parse(cachedData);
  } else {
    data = JSON.parse(JSON.stringify(cachedData)); //UpStash
  }
  return data;
};

const setDataInCache = async (key, data, expiryInSeconds = 3600) => {
  // await redis.set(key, JSON.stringify(posts), "EX", expiryInSeconds);  // Cache for 1 hour
  await redis.set(key, JSON.stringify(data), { ex: expiryInSeconds }); // Cache for 1 hour
};

const deleteCacheKeys = async (keys) => {
  redis.del(...keys);
}

// function normalizeParams(params) {
//   if (params == null) return [];
//   return Array.isArray(params) ? params : [params];
// }

export default { getDataFromCache, deleteCacheKeys };
