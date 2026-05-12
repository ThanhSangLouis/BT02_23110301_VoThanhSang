const Redis = require('ioredis');

let redis;

// Trong development không có Redis, dùng in-memory mock
const createMockRedis = () => {
  console.warn('⚠️  Redis không khả dụng — dùng in-memory mock (OTP vẫn hoạt động trong session)');
  const store = new Map();
  const expiryMap = new Map();

  return {
    set: async (key, value, exFlag, ttl) => {
      store.set(key, value);
      if (exFlag === 'EX' && ttl) {
        // Auto-delete after TTL
        const timer = setTimeout(() => { store.delete(key); expiryMap.delete(key); }, ttl * 1000);
        const existing = expiryMap.get(key);
        if (existing) clearTimeout(existing);
        expiryMap.set(key, timer);
      }
      return 'OK';
    },
    get: async (key) => store.get(key) || null,
    del: async (key) => { store.delete(key); return 1; },
    on:  () => {},
  };
};

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    connectTimeout: 3000,
    retryStrategy: (times) => {
      if (times > 2) return null;
      return Math.min(times * 200, 1000);
    },
    maxRetriesPerRequest: 1,
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => {
    console.warn(`⚠️  Redis: ${err.message} — fallback to in-memory store`);
    if (redis && redis._events) {
      Object.assign(redis, createMockRedis());
    }
  });

  redis.connect().catch(() => {
    Object.assign(redis, createMockRedis());
  });

} catch {
  redis = createMockRedis();
}

module.exports = redis;
