module.exports = {
  port: process.env.PORT || 8000,
  db: {
    prod: process.env.DATABASE_URL || 'mongodb://localhost/stackoverflow-clone',
    test: 'mongodb://localhost/stackoverflow-test',
    options: {}
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development_secret',
    expiry: '7d'
  }
};
