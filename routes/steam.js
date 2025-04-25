import express from 'express';
import url from 'url';

const router = express.Router();

router.get('/auth', (req, res) => {
  const steamRedirect = `https://steamcommunity.com/openid/login?` +
    `openid.ns=http://specs.openid.net/auth/2.0&` +
    `openid.mode=checkid_setup&` +
    `openid.return_to=https://skinrush-api-16vx.onrender.com/api/steam/callback&` +  // ✅ new domain
    `openid.realm=https://skinrush-api-16vx.onrender.com&` +                          // ✅ new domain
    `openid.identity=http://specs.openid.net/auth/2.0/identifier_select&` +
    `openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;

  res.redirect(steamRedirect);
});


export default router;
