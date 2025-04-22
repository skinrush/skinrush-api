import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await axios.post(
      'https://www.wixapis.com/members/v1/members/query',
      {
        // You can add filter params here if needed
      },
      {
        headers: {
          'Authorization': process.env.WIX_API_KEY,
          'wix-site-id': process.env.WIX_SITE_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Members found:', response.data.members);
    res.json(response.data.members);
  } catch (error) {
    console.error('❌ Error fetching members:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch members',
      details: error.response?.data || error.message
    });
  }
});

export default router;

router.get('/profile', async (req, res) => {
  const wixUserId = req.query.userId;

  if (!wixUserId) {
    return res.status(400).json({ error: 'Missing Wix User ID' });
  }

  try {
    const response = await axios.post(
      'https://www.wixapis.com/members/v1/members/query',
      {
        filter: {
          fieldName: 'id',
          operator: 'EQ',
          value: wixUserId
        }
      },
      {
        headers: {
          'Authorization': process.env.WIX_API_KEY,
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
      id: member.id,
      nickname: member.profile?.nickname,
      slug: member.profile?.slug,
      photo: member.profile?.photo?.url || null,
      created: member.createdDate
    });
  } catch (error) {
    console.error('❌ Error fetching member profile:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
