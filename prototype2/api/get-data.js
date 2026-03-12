import Redis from 'ioredis';

// Ensure we handle missing REDIS_URL gracefully before initializing
let redis;

export default async function handler(req, res) {
  if (!process.env.REDIS_URL) {
    return res.status(500).json({ error: 'REDIS_URL environment variable is missing on the server.' });
  }

  if (!redis) {
     try {
       redis = new Redis(process.env.REDIS_URL);
     } catch (e) {
       return res.status(500).json({ error: 'Failed to initialize Redis client. Invalid REDIS_URL format.' });
     }
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Removed authentication check for GET.
  // Read operations (loading data) are now public.

  try {
    const [inventoryDataStr, transactionHistoryStr, palletCapacitiesStr] = await Promise.all([
      redis.get('cohin_inventoryData'),
      redis.get('cohin_transactionHistory'),
      redis.get('cohin_palletCapacities')
    ]);

    // ioredis returns strings, so we need to parse them back into JSON objects
    return res.status(200).json({
      inventoryData: inventoryDataStr ? JSON.parse(inventoryDataStr) : null,
      transactionHistory: transactionHistoryStr ? JSON.parse(transactionHistoryStr) : null,
      palletCapacities: palletCapacitiesStr ? JSON.parse(palletCapacitiesStr) : null
    });
  } catch (error) {
    console.error("Error fetching data from Redis:", error);
    return res.status(500).json({ error: 'Failed to fetch data from Redis', details: error.message });
  }
}
