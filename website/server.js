const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// API routes (if needed for any additional backend functionality)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Recycler Website Server is running' });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Recycler Website Server running on port ${PORT}`);
  console.log(`📱 React app served at http://localhost:${PORT}`);
});
