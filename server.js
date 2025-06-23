const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Create the app
const app = express();

// Middleware to parse JSON & form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// (Optional) Example of custom middleware — currently does nothing
app.use((req, res, next) => {
  // You can add logging or auth checks here if needed
  next();
});

// Serve static files (e.g. your HTML form) from /public
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/erx', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mount API router
const { router: rxRouter } = require('./api/rx');
app.use(rxRouter);

// (Optional) 404 handler for any unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const PORT = 3018;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
