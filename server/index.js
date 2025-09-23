// Polyfill for ReadableStream in older Node.js versions
if (!globalThis.ReadableStream) {
  const { ReadableStream } = require('web-streams-polyfill');
  globalThis.ReadableStream = ReadableStream;
}

const app = require("./app");
const mongoose = require("mongoose");
const config = require("./config");

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

const connect = url => {
  return mongoose.connect(url, config.db.options);
};

if (require.main === module) {
  // Get port from environment or config
  const PORT = process.env.PORT || config.port;
  
  console.log(`🚀 Starting server on port ${PORT}...`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log(`📍 Database: ${config.db.prod.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  });
  
  connect(config.db.prod)
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message);
      // Don't exit in development for easier debugging
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
    
  mongoose.connection.on('error', (error) => {
    console.error('❌ Database error:', error);
  });
}

module.exports = { connect };

