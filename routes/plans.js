import 'dotenv/config';
import express from 'express';
import { createClient, ApiKeyStrategy } from '@wix/sdk';

const router = express.Router();

// Dynamically import the pricingPlans module because it's CommonJS
const { default: wixPricingPlans } = await import('@wix/pricing-plans');

// Create the Wix client
const wixClient = createClient({
  modules: {
    pricingPlans: wixPricingPlans
  },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY
  })
});

// Route to check if a user has the Beta Access plan
router.get('/check-beta-access', async (req, res) => {
  try {
    const wixUserId = req.query.userId;

    if (!wixUserId) {
      return res.status(400).json({ error: 'Missing Wix User ID' });
    }

    const memberships = await wixClient.pricingPlans.queryMemberships({
      filter: { userId: wixUserId }
    });

    const hasBetaAccess = memberships.memberships.some(
      m => m.planName.toLowerCase() === 'beta access'
    );

    return res.json({ hasBetaAccess });
  } catch (error) {
    console.error('Wix Plan Check Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
