const express = require('express');
const router = express.Router();

// Placeholder untuk SNMP routes
router.get('/profiles', (req, res) => {
  res.json([]);
});

router.post('/profiles', (req, res) => {
  res.json({ message: 'SNMP profile created' });
});

module.exports = router;