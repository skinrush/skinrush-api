import express from 'express';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { authentication } from '@wix/members';

const router = express.Router();

const wixClient = createClient({
  modules: { authentication },
  auth: OAuthStrategy({
    clientId: process.env.WIX_CLIENT_ID,
    clientSecret: process.env.WIX_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback' // for production: change this
  })
});

// ✅ /login → Redirects to Wix Login Page
router.get('/login', async (req, res) => {
  const loginUrl = await wixClient.auth.generateAuthUrl();
  res.redirect(loginUrl);
});

// ✅ /callback → Handles return from Wix
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing auth code');
  }

  try {
    const { member } = await wixClient.auth.getMemberDetailsFromCode(code);
    const wixUserId = member.id;
    const email = member.profile?.email;

    console.log('✅ Wix Login Success:', wixUserId, email);

    // You can store this in a cookie, session, or DB later
    res.json({
      message: 'Logged in!',
      wixUserId,
      email
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).send('Login failed');
  }
});

export default router;
