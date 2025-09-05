// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = 3018;

(async () => {
  const app = express();

  // Parse JSON & form data
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Static files
  app.use(express.static('public'));

  // Optional: fail fast instead of buffering queries when disconnected
  mongoose.set('bufferCommands', false);
  mongoose.set('strictQuery', true);

  // Helpful connection logs
  mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
  mongoose.connection.on('error', err => console.error('❌ MongoDB error:', err));
  mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));

  // Actually connect and WAIT for it
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/erx',
    {
      // In modern Mongoose these legacy flags are ignored; leave them out or keep harmlessly
      serverSelectionTimeoutMS: 5000, // faster failure if mongod is down/unreachable
      maxPoolSize: 10,
    }
  );

  // Only require and mount router *after* connect so models bind to the live connection
  const { router: rxRouter } = require('./api/rx');
  app.use(rxRouter);

  // Simple health endpoint (also shows DB state)
  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, dbState: mongoose.connection.readyState }); // 1 == connected
  });

  // 404
  app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
})().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
