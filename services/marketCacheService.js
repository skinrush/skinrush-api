const axios = require('axios');
const cache = new Map(); // 🔄 In-memory storage

const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;
const CACHE_TTL = 10 * 60 * 1000; // ⏳ 10 minutes

/**
 * Fetch market data and cache results
 * @param {string} query - Search term (e.g., "ak-47 redline")
 * @param {number} limit - Number of results
 * @returns Cached or fresh data from CSFloat
 */
async function fetchMarketData(query, limit = 5) {
  const cacheKey = `${query}:${limit}`;
  const cached = cache.get(cacheKey);

  // ✅ Return cache if still fresh
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    // 🔌 Hit external API if no cache or expired
    const res = await axios.get('https://api.csfloat.com/v1/listings', {
      headers: {
        Authorization: `Bearer ${CSFLOAT_API_KEY}`,
      },
      params: { search: query, limit },
    });

    const data = res.data;

    // 💾 Save to cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (err) {
    console.error('CSFloat API error ❌', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { fetchMarketData };
