// Polyfill for ReadableStream in older Node.js versions
if (!globalThis.ReadableStream) {
  const { ReadableStream } = require('web-streams-polyfill');
  globalThis.ReadableStream = ReadableStream;
}

const app = require("./app");
const mongoose = require("mongoose");
const config = require("./config");

const connect = url => {
  return mongoose.connect(url, config.db.options);
};

if (require.main === module) {
  app.listen(config.port);
  connect(config.db.prod);
  mongoose.connection.on('error', console.log);
}

module.exports = { connect };

