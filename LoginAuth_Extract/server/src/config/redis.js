const Redis = require('ioredis');

// In-memory mock khi Redis không khả dụng
const mockRedis = {
  _store: new Map(),
  _timers: new Map(),

  set: async function(key, value, exFlag, ttl) {
    this._store.set(key, value);
    if (exFlag === 'EX' && ttl) {
      const existing = this._timers.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        this._store.delete(key);
        this._timers.delete(key);
      }, ttl * 1000);
      this._timers.set(key, timer);
    }
    return 'OK';
  },

  get: async function(key) {
    return this._store.get(key) || null;
  },

  del: async function(key) {
    this._store.delete(key);
    const timer = this._timers.get(key);
    if (timer) { clearTimeout(timer); this._timers.delete(key); }
    return 1;
  },

  on: function() {},

  isMock: true,
};

// Singleton - chỉ khởi tạo 1 lần
let _client = mockRedis;
let _isConnected = false;

const config = {
  lazyConnect: true,
  connectTimeout: 5000,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 300, 2000);
  },
};

const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', config);

client.on('connect', () => {
  console.log('✅ Redis connected');
  _client = client;
  _isConnected = true;
});

client.on('ready', () => {
  console.log('✅ Redis ready');
});

client.on('error', (err) => {
  console.warn(`⚠️  Redis error: ${err.message}`);
});

client.on('close', () => {
  console.warn('⚠️  Redis connection closed');
  _isConnected = false;
});

// Connect (non-blocking)
client.connect().catch(() => {
  console.warn('⚠️  Cannot connect to Redis — using in-memory store');
});

// Export proxy object - luôn trỏ đến client đúng
module.exports = {
  async set(...args) {
    return await _client.set(...args);
  },
  async get(...args) {
    return await _client.get(...args);
  },
  async del(...args) {
    return await _client.del(...args);
  },
  on(event, callback) {
    client.on(event, callback);
  },
  get isConnected() {
    return _isConnected;
  },
};
