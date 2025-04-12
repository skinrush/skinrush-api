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

// ✅ CSFloat live market endpoint
app.get('/api/item', async (req, res) => {
  try {
    const { search = 'ak-47 redline', limit = 1 } = req.query;

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

// 🧠 Optional DB import for dev mode
if (process.env.NODE_ENV !== 'production' && process.env.IMPORT_SKINS === 'true') {
  require('./importSkins');
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
