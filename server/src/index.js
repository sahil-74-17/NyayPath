const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoints
const healthResponse = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'nyaypath-server',
    milestone: 'M0',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthResponse);
app.get('/api/health', healthResponse);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NyayPath API',
    description: 'AI Legal Aid Assistant for Ordinary Citizens',
    version: '1.0.0',
    milestone: 'M0',
    health: '/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`NyayPath Server running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
}

module.exports = app;
