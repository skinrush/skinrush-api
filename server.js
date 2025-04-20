import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { createClient, OAuthStrategy } from '@wix/sdk';

import sequelize from './db.js';
import { Skin } from './models/Skin.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CSFLOAT_API_KEY = process.env.CSFLOAT_API_KEY;

// 🔁 Import Wix pricingPlans module dynamically
const wixPricingPlansModule = await import('@wix/pricing-plans');
const wixPricingPlans = wixPricingPlansModule?.pricingPlans || wixPricingPlansModule?.default;

if (!wixPricingPlans) {
  throw new Error('❌ Failed to load Wix Pricing Plans module');
}

// 🔨 Init Wix Client
const wixClient = createClient({
  modules: {
    pricingPlans: wixPricingPlans
  },
  auth: OAuthStrategy({
    clientId: process.env.WIX_CLIENT_ID,
    clientSecret: process.env.WIX_CLIENT_SECRET
  })
});

// 💾 Cache for CSFloat API
const marketCache = {};
const CACHE_DURATION_MS = 10 * 60 * 1000;

// 🌐 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: 'https://www.skinrush.pro' }));
} else {
  app.use(cors());
}

// 🔐 Routes
app.use('/auth', authRoutes);

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

// ✅ Check Beta Access Plan
app.get('/api/check-beta-access', async (req, res) => {
  try {
    const wixUserId = req.query.userId;
    if (!wixUserId) {
      return res.status(400).json({ error: 'Missing Wix User ID' });
    }

    const memberships = await wixClient.pricingPlans.queryMemberships({
      filter: { userId: wixUserId }
    });

    const hasBetaAccess = memberships.memberships.some(m => m.planName === 'Beta Access');
    return res.json({ hasBetaAccess });
  } catch (error) {
    console.error('❌ Beta Access Check Error:', error);
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
