const express = require('express');
const router = express.Router();
const { runSeed } = require('../seeds/seedDatabase');

router.post('/run', async (req, res) => {
  try {
    await runSeed();
    res.json({ success: true, message: 'Database re-seeded successfully with deterministic dataset.' });
  } catch (error) {
    console.error('Error running seed from API:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
