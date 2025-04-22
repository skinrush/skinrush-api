import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { createClient, ApiKeyStrategy } from '@wix/sdk';

import sequelize from './db.js';
import { Skin } from './models/Skin.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;

const { default: rawPricingPlans } = await import('@wix/pricing-plans');

// 🧼 Strip out event handlers (or any undefined values that crash the SDK)
const cleanPricingPlans = {};
for (const key in rawPricingPlans) {
  if (rawPricingPlans[key] && typeof rawPricingPlans[key] === 'object') {
    cleanPricingPlans[key] = {};
    for (const subKey in rawPricingPlans[key]) {
      const val = rawPricingPlans[key][subKey];
      if (val && typeof val === 'function') {
        cleanPricingPlans[key][subKey] = val;
      }
    }
  }
}

// ✅ Create the client with sanitized module
const wixClient = createClient({
  modules: {
    pricingPlans: cleanPricingPlans
  },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY
  })
});




// 💾 Cache for CSFloat API
const marketCache = {};
const CACHE_DURATION_MS = 10 * 60 * 1000;

// 🌐 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['https://www.skinrush.pro', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// 🔐 Routes
app.use('/auth', authRoutes);
import membersRoute from './routes/members.js';
app.use('/api/members', membersRoute);

import steamRoutes from './routes/steam.js';
app.use('/api/steam', steamRoutes);



// ✅ Health check
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ✅ Fetch skins from your database
app.get('/api/skins', async (req, res) => {
  try {
    const skins = await Skin.findAll();
    res.json(skins);
  } catch (err) {
    console.error('❌ Fetch skins error:', err.message);
    res.status(500).json({ error: 'Failed to fetch skins', details: err.message });
  }
});

// ✅ Query CSFloat listings
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
      params: { search, limit },
    });

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

// ✅ Check Beta Access Plan (manual call with wix-site-id header)
app.get('/api/check-beta-access', async (req, res) => {
  try {
    const wixUserId = req.query.userId;
    if (!wixUserId) {
      return res.status(400).json({ error: 'Missing Wix User ID' });
    }

    const response = await axios.post(
      'https://www.wixapis.com/pricing-plans/v2/memberships/query',
      {
        filter: { userId: wixUserId }
      },
      {
        headers: {
          'Authorization': process.env.WIX_API_KEY,
          'wix-site-id': process.env.WIX_SITE_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    const memberships = response.data.memberships || [];
    const hasBetaAccess = memberships.some(m => m.planName === 'Beta Access');

    return res.json({ hasBetaAccess });
  } catch (error) {
    console.error('❌ Beta Access Check Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ Start your server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🧠 Optional: dev-only import logic
if (process.env.NODE_ENV !== 'production' && process.env.IMPORT_SKINS === 'true') {
  await import('./importSkins.js');
}
