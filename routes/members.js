import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/profile', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const response = await axios.post(
      'https://www.wixapis.com/members/v1/members/query',
      {
        filter: {
          userId: userId
        }
      },
      {
        headers: {
          Authorization: process.env.WIX_API_KEY,
          'wix-site-id': process.env.WIX_SITE_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    const member = response.data.members?.[0];

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      nickname: member.profile?.nickname || '',
      photo: member.profile?.photo?.url || '',
      steamId: member.profile?.customFields?.find(f => f.name === 'steamId')?.value || ''
    });

  } catch (err) {
    console.error('❌ Error fetching member profile:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch member profile', details: err.message });
  }
});

export default router;
