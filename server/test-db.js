// Test database connection
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔗 Testing database connection...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Missing');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE_URL, {})
  .then(() => {
    console.log('✅ Database connected successfully!');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });