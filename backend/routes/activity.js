const express = require('express');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    // ?page=1&limit=20 from the frontend. Defaults keep old behavior sane
    // if the frontend ever calls this without params.
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const { items, total } = await Activity.getRecentActivity(req.user.id, limit, skip);

    res.json({
      activity: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    await Activity.clearActivity(req.user.id);
    res.json({ message: 'Activity cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear activity' });
  }
});

module.exports = router;