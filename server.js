require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// 🧱 Sequelize DB setup
const sequelize = require('./db');  // DB connector
const Skin = require('./models/Skin');  // Skin model

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;

// 🔁 Market cache store (memory-based)
const marketCache = {}; // { searchQuery: { timestamp, data } }
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes


// 🌐 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 CORS Config
if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: 'https://www.skinrush.pro' }));
} else {
  app.use(cors());
}

// ✅ Confirm DB connection
sequelize.authenticate()
  .then(() => console.log('✅ Connected to DB'))
  .catch(err => console.error('❌ DB connection failed:', err));

// ✅ Health check endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ✅ Skin DB endpoint
app.get('/api/skins', async (req, res) => {
  try {
    const skins = await Skin.findAll();
    res.json(skins);
  } catch (err) {
    console.error('❌ Fetch skins error:', err.message);
    res.status(500).json({ error: 'Failed to fetch skins', details: err.message });
  }
});

app.get('/api/item', async (req, res) => {
  try {
    const { search = 'ak-47 redline', limit = 10 } = req.query;
    const key = `${search}_${limit}`;

    // ⏱️ Check if cache is still valid
    const cached = marketCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return res.json(cached.data); // 🚀 Serve cached data
    }

    // 🌐 Make fresh API call
    const response = await axios.get('https://api.csfloat.com/v1/listings', {
      headers: { Authorization: `Bearer ${CSFLOAT_API_KEY}` },
      params: { search, limit },
    });

    // 💾 Store to cache
    marketCache[key] = {
      timestamp: Date.now(),
      data: response.data,
    };

    res.json(response.data);

  } catch (error) {
    console.error('❌ CSFloat API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch data from CSFloat',
      details: error.response?.data || error.message,
    });
  }
});

// 🧠 Optional DB import for dev mode
if (process.env.NODE_ENV !== 'production' && process.env.IMPORT_SKINS === 'true') {
  require('./importSkins');
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
