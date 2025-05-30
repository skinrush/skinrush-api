import express from 'express';
import url from 'url';

const router = express.Router();

router.get('/auth', (req, res) => {
  const steamRedirect = `https://steamcommunity.com/openid/login?` +
    `openid.ns=http://specs.openid.net/auth/2.0&` +
    `openid.mode=checkid_setup&` +
    `openid.return_to=https://skinrush-api-16vx.onrender.com/api/steam/callback&` +
    `openid.realm=https://skinrush-api-16vx.onrender.com&` +
    `openid.identity=http://specs.openid.net/auth/2.0/identifier_select&` +
    `openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;

  res.redirect(steamRedirect);
});

router.get('/callback', (req, res) => {
  const claimedId = req.query['openid.claimed_id'];

  if (!claimedId) {
    return res.status(400).send('Steam login failed: missing claimed_id');
  }

  const steamId = claimedId.split('/').pop(); // extract the SteamID from the URL
  console.log('✅ Linked SteamID:', steamId);

  res.redirect(`https://www.skinrush.pro/steam-linked?steamId=${steamId}`);
});

export default router;
