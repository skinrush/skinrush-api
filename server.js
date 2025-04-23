import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

import sequelize from './db.js';
import { Skin } from './models/Skin.js';
import authRoutes from './routes/auth.js';
import membersRoute from './routes/members.js';
import steamRoutes from './routes/steam.js';

// ✅ App + Port
const app = express();
const PORT = process.env.PORT || 3000;
const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;

// ✅ CORS setup (works for both preflight + standard)
const corsOptions = {
  origin: 'https://www.skinrush.pro',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.options('*', cors(corsOptions)); // Preflight CORS
app.use(cors(corsOptions));          // Main CORS

// ✅ Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CSFloat Cache
const marketCache = {};
const CACHE_DURATION_MS = 10 * 60 * 1000;

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoute);
app.use('/api/steam', steamRoutes);

// ✅ Health check
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ✅ Fetch skins from DB
app.get('/api/skins', async (req, res) => {
  try {
    const skins = await Skin.findAll();
    res.json(skins);
  } catch (err) {
    console.error('❌ Error fetching skins:', err.message);
    res.status(500).json({ error: 'Failed to fetch skins' });
  }
});

// ✅ CSFloat API
app.get('/api/item', async (req, res) => {
  try {
    const { search = 'ak-47 redline', limit = 10 } = req.query;
    const key = `${search}_${limit}`;

    const cached = marketCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return res.json(cached.data);
    }

    const response = await axios.get('https://api.csfloat.com/v1/listings', {
      headers: { Authorization: `Bearer ${CSFLOAT_API_KEY}` },
      params: { search, limit }
    });

    marketCache[key] = {
      timestamp: Date.now(),
      data: response.data
    };

    res.json(response.data);
  } catch (error) {
    console.error('❌ CSFloat error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch data from CSFloat' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
