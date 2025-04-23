import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

import sequelize from './db.js';
import { Skin } from './models/Skin.js';
import authRoutes from './routes/auth.js';
import membersRoute from './routes/members.js';
import steamRoutes from './routes/steam.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;

// ✅ Full CORS options
const corsOptions = {
  origin: 'https://www.skinrush.pro',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// ✅ Apply CORS middleware
app.options('*', cors(corsOptions));   // Preflight support
app.use(cors(corsOptions));            // Standard support

app.use((req, res, next) => {
  const allowedOrigin = 'https://www.skinrush.pro';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // ✅ Short-circuit preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});


// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Route setup
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoute);
app.use('/api/steam', steamRoutes);

// ✅ Health check
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ✅ Skin data from DB
app.get('/api/skins', async (req, res) => {
  try {
    const skins = await Skin.findAll();
    res.json(skins);
  } catch (err) {
    console.error('❌ Error fetching skins:', err.message);
    res.status(500).json({ error: 'Failed to fetch skins' });
  }
});

// ✅ CSFloat lookup with basic cache
const marketCache = {};
const CACHE_DURATION_MS = 10 * 60 * 1000;

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
