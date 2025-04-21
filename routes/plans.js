import 'dotenv/config';
import express from 'express';
import { pricingPlans } from '@wix/pricing-plans';
import { createClient, OAuthStrategy } from '@wix/sdk';

const router = express.Router();

const wixClient = createClient({
  modules: { pricingPlans },
  auth: OAuthStrategy({
    clientId: process.env.WIX_CLIENT_ID,
    clientSecret: process.env.WIX_CLIENT_SECRET
  })
});

router.get('/check-beta-access', async (req, res) => {
  try {
    // TODO: Replace with the actual Wix user ID you get after login
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
    console.error('Wix Plan Check Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
