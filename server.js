require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// 🧱 Sequelize DB setup
const sequelize = require('./db');  // DB connector
const Skin = require('./models/Skin');  // Skin model

const app = express();

// Configure CORS based on environment
if (process.env.NODE_ENV === 'production') {
  // Only allow requests from skinrush
  app.use(cors({ origin: 'https://www.skinrush.pro' }));
} else {
  app.use(cors());
}

const PORT = process.env.PORT || 3000;
const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;

// Database sync: only auto-sync in development
// if (process.env.NODE_ENV !== 'production') {
//  sequelize.sync({ alter: true })
//    .then(() => console.log('🧠 DB synced (development auto-sync)'))
//    .catch(err => console.error('❌ DB sync failed:', err));
//} else {
//  console.log('Running in production mode. Ensure migrations are applied.');
//}

// ✅ Test endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ✅ Live CSFloat market data endpoint
app.get('/api/item', async (req, res) => {
  try {
    const { search = 'ak-47 redline', limit = 10 } = req.query;

    const response = await axios.get('https://api.csfloat.com/v1/listings', {
      headers: {
        Authorization: `Bearer ${CSFLOAT_API_KEY}`,
      },
      params: { search, limit },
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ CSFloat API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch data from CSFloat',
      details: error.response?.data || error.message,
    });
  }
});

// Endpoint to fetch skin metadata from your database
app.get('/api/skins', async (req, res) => {
  try {
    const skins = await Skin.findAll();
    res.json(skins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skins', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Only run the import script in non-production mode
if (process.env.NODE_ENV !== 'production' && process.env.IMPORT_SKINS === 'true') {
  require('./importSkins');
}
