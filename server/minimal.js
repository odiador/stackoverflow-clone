// Minimal server for debugging
require('dotenv').config();
console.log('🔧 Starting minimal server...');

// Check environment variables
console.log('Environment checks:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || 'not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'configured' : 'missing');

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({ message: 'Minimal server is working!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

console.log(`🚀 Starting server on port ${port}...`);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});