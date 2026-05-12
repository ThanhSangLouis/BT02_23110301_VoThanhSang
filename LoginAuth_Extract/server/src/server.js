require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app       = require('./app');
const connectDB = require('./config/database');

// Initialize Redis (connect event logged inside)
require('./config/redis');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy trên port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
});
